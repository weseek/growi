import sys
import os

from learned_BP import *  # noqa
from itertools import product  # noqa

def multi_loss_CE(x, outputs, discount):
    return multi_loss(cross_entropy, x, outputs, discount)

def multi_loss_sBER(x, outputs, discount):
    return multi_loss(soft_BER, x, outputs, discount)

# Give name and directory of a set of trainings
exp_name = '/Users/ryojishimizu/research/ConstructionD_NBP/bch_lattice/001116'
exp_dir = os.path.join('.', exp_name)

if not os.path.exists(exp_dir):
    os.system(f'mkdir {exp_dir}')
if not os.path.exists(f'{exp_dir}/ckpts'):
    os.system(f'mkdir {exp_dir}/ckpts')
if not os.path.exists(f'{exp_dir}/logs'):
    os.system(f'mkdir {exp_dir}/logs')
if not os.path.exists(f'{exp_dir}/test_results'):
    os.system(f'mkdir {exp_dir}/test_results')

CUDA = False
handler_kwargs = {
    'checkpoint_dir': f'{exp_dir}/ckpts',           # directory to store training checkpoints
    'tensorboard_dir': f'{exp_dir}/logs',           # directory to store tensorboard logs
    'test_result_dir': f'{exp_dir}/test_results',   # directory to store simulation results
    'report_every': 50,                             # write one tensorboard point every such many mini-batches
    'use_cuda': CUDA,                               # whether to use CUDA
    'lr_init': 1e-3,                                # initial learning rate
    'loss': multi_loss_CE,
    'weight_decay': 0.0,                            # L2 regularization term
    'grad_clip': 0.1,                               # gradient clipping
    'optimizer': 'RMSprop',                         # optimizer
    #'lr_lambda': 'lambda ep: 0.8 ** (ep // 5)',     # learning rate decay along epoch number
    # multiloss discount as a function of initial discount factor and epoch number
    #'discount_lambda': 'lambda d_init, ep: d_init * 0.5 ** (min(ep, 40) // 5)',
    # additional information to append at the end of the model name
    #'name_suffix': 'lr_decay_factor=0.8,discount_decay_factor=0.9',
}

# model arguments of BP with 5 iterations.
model_kwargs = {
    'T': 5,
    'tie': True,
    'use_cuda': CUDA,
    'damping_init': 1,
    'damping_train': False,
}

# create the linear code, mode determines parity-check matrix
code = BCH_Code(63, 57, mode='e', use_cuda=CUDA)
# create the channel
channel = AWGN_Channel([1, 9])
# create data loader for generating mini-batches
loader = DataLoader(code, channel, 120, use_cuda=CUDA)

# # train and simulate a set of Neural BP decoders over a grid
for args in product(['full'],[0.8],[0.5]): #(['plain','simple','full'], [0.8],[0.5]):# [0.5, 0]):
    mode, lr_decay, discount_decay = args
    #mode, lr_decay, discount_decay = 'simple', 0.8, 0.5
    extra_model = {
        'mode': mode,
    }
    extra = {
        # learning rate decay along epoch number
        'lr_lambda': f'lambda ep: {lr_decay} ** (ep // 5)',
        # multiloss discount as a function of initial discount factor and epoch number
        'discount_lambda': f'lambda d_init, ep: d_init * {discount_decay} ** (min(ep, 40) // 5)',
        # additional information to append at the end of the model name
        'name_suffix': f'lr_decay_factor={lr_decay},discount_decay_factor={discount_decay}'
    }

    # construct BP decoder
    model = BP_Decoder(code, **model_kwargs, **extra_model)
    # create train handler
    handler = TrainHandler(loader, model, **handler_kwargs, **extra)
    print(handler.name())
    # train for 50 epochs, in this case 50k mini-batches
    handler.train(5)
    # simulate the decoder after training
    handler.test(np.arange(1, 9.5, 0.5), min_word_error=1000, min_mb_num=20000)