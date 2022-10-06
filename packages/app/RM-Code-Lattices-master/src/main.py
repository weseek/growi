

def encode(_G_mat, info_bits):
    _N = _G_mat.size()[1]
    _K = _G_mat.size()[0]
    codeword = np.zeros(_N)
    for i in range(_N):
        for j in range(_K):
            codeword[i] += info_bits[j] * _G_mat[j][i]
    return codeword

def generate_lattice(mod_input):
    symbols = np.zeros(n)
    for i in range(n):
        tmp = 0
        for j in range(num_level + 1):
            tmp += (1 << j) * mod_input[j][i]
        symbols[i] = tmp
    return symbols

def AWGN_channel(x, sigma2):
    y = np.zeros(n):
    for i in range(n):
        y[i] = x[i] + np.sqrt(sigma2) * np.random.normal(0, 1.0)
    return y

def mod_triangle(value):
    return np.fabs( np.fmod(value + 1.0, 2.0) - 1.0 )

def subtract(x, dec):
    y = np.zeros(n)
    for i in range(n):
        y[i] = x[i] - dec[i]
        y[i] /= 2.0
    return y

def hard_decision(logit):
    # Make hard decision on LLR = log(p0/p1)
    if logit < 0: return 1
    return 0
