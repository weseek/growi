// Proves task 9.1's screen-level contract:
//   - the screen renders relation state (active/unpaired) from the list
//     endpoint
//   - capabilities render GENERICALLY -- a fabricated, never-seen-before
//     capability field is rendered rather than silently dropped, proving no
//     hardcoded per-platform switch exists
//   - live connection status shows for an active relation
//   - the encryption-key-unconfigured state disables pairing and shows why
//   - submitting the pairing form calls the pairing endpoint with the
//     entered fields

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  apiv3Get: vi.fn(),
  apiv3Post: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('~/client/util/apiv3-client', () => ({
  apiv3Get: mocks.apiv3Get,
  apiv3Post: mocks.apiv3Post,
}));

vi.mock('~/client/util/toastr', () => ({
  toastError: mocks.toastError,
  toastSuccess: mocks.toastSuccess,
}));

import { AdminChatIntegration } from './AdminChatIntegration';

interface AdminRelationListItem {
  readonly relationId: string;
  readonly platform: string;
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly label: string | null;
  readonly state: 'active' | 'unpaired';
  readonly createdAt: string;
  readonly unpairedAt: string | null;
}

const ACTIVE_RELATION: AdminRelationListItem = {
  relationId: 'relation-active',
  platform: 'slack',
  workspaceId: 'workspace-1',
  workspaceName: 'Active Workspace',
  label: null,
  state: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  unpairedAt: null,
};

const UNPAIRED_RELATION: AdminRelationListItem = {
  relationId: 'relation-unpaired',
  platform: 'discord',
  workspaceId: 'workspace-2',
  workspaceName: 'Old Workspace',
  label: 'Old label',
  state: 'unpaired',
  createdAt: '2026-01-01T00:00:00.000Z',
  unpairedAt: '2026-02-01T00:00:00.000Z',
};

const CAPABILITY_REPORT = {
  platforms: [
    {
      platform: 'slack',
      capabilities: [
        { capability: 'slashCommand', level: 'none', substitute: 'mention' },
        {
          capability: 'never-seen-before-capability',
          level: 'degraded',
          substitute: 'a made-up workaround',
        },
      ],
    },
  ],
};

const CONNECTION_STATUS = {
  platform: 'slack',
  health: 'connected',
  since: '2026-01-01T00:00:00.000Z',
};

// Route apiv3Get by URL, matching the exact endpoints AdminChatIntegration
// calls -- this is the observable contract (which endpoints get hit), not
// an implementation spy on internal function names.
const stubApi = ({
  encryptionConfigured = true,
  relations = [ACTIVE_RELATION],
}: {
  encryptionConfigured?: boolean;
  relations?: AdminRelationListItem[];
} = {}) => {
  mocks.apiv3Get.mockImplementation((url: string) => {
    if (url === '/chat-integration/admin/encryption-status') {
      return Promise.resolve({
        data: encryptionConfigured
          ? { configured: true }
          : { configured: false, reason: 'unset' },
      });
    }
    if (url === '/chat-integration/admin/relations') {
      return Promise.resolve({ data: { relations } });
    }
    if (url.endsWith('/capabilities')) {
      return Promise.resolve({ data: CAPABILITY_REPORT });
    }
    if (url.endsWith('/connection-status')) {
      return Promise.resolve({ data: CONNECTION_STATUS });
    }
    return Promise.reject(new Error(`unexpected URL: ${url}`));
  });
};

// Fresh SWR cache per render -- otherwise a later test's fetch resolves
// instantly from a previous test's cached data instead of calling
// `apiv3Get` again (same reasoning as this feature's other client specs).
const renderScreen = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <AdminChatIntegration />
    </SWRConfig>,
  );

describe('AdminChatIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders each relation with its workspace name, platform, and lifecycle state', async () => {
    stubApi({ relations: [ACTIVE_RELATION, UNPAIRED_RELATION] });

    renderScreen();

    expect(await screen.findByText('Active Workspace')).toBeInTheDocument();
    expect(await screen.findByText('Old label')).toBeInTheDocument();
    const rows = await screen.findAllByTestId(
      'grw-chat-integration-relation-row',
    );
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('active')).toBeInTheDocument();
    expect(within(rows[1]).getByText('unpaired')).toBeInTheDocument();
  });

  it('renders CapabilityReport generically, including a fabricated field no known platform sends', async () => {
    stubApi({ relations: [ACTIVE_RELATION] });

    renderScreen();

    // Both a known-shaped capability AND the fabricated one must render --
    // if the component had a hardcoded per-platform switch instead of a
    // generic loop, the fabricated one would be silently dropped.
    expect(await screen.findByText('slashCommand')).toBeInTheDocument();
    expect(
      await screen.findByText('never-seen-before-capability'),
    ).toBeInTheDocument();
    expect(screen.getByText('a made-up workaround')).toBeInTheDocument();

    // A KNOWN capability's own level/substitute must also come through
    // verbatim -- not just its name. Without this, a hardcoded override
    // for a specific known capability name (e.g. "always show slashCommand
    // as unsupported") could silently replace what the proxy actually
    // reported, while the fabricated-field assertions above would still
    // pass untouched (they only prove unknown fields aren't dropped).
    const rows = await screen.findAllByTestId(
      'grw-chat-integration-capability-row',
    );
    const slashCommandRow = rows.find((row) =>
      within(row).queryByText('slashCommand'),
    );
    expect(slashCommandRow).toBeDefined();
    expect(
      within(slashCommandRow as HTMLElement).getByText('none'),
    ).toBeInTheDocument();
    expect(
      within(slashCommandRow as HTMLElement).getByText('mention'),
    ).toBeInTheDocument();
  });

  it('does not fetch capabilities/connection-status for an unpaired relation', async () => {
    stubApi({ relations: [UNPAIRED_RELATION] });

    renderScreen();

    expect(await screen.findByText('Old label')).toBeInTheDocument();
    await waitFor(() => {
      expect(mocks.apiv3Get).toHaveBeenCalledWith(
        '/chat-integration/admin/relations',
      );
    });
    expect(mocks.apiv3Get).not.toHaveBeenCalledWith(
      expect.stringContaining('capabilities'),
    );
    expect(mocks.apiv3Get).not.toHaveBeenCalledWith(
      expect.stringContaining('connection-status'),
    );
  });

  it("shows the active relation's live connection health", async () => {
    stubApi({ relations: [ACTIVE_RELATION] });

    renderScreen();

    expect(
      await screen.findByTestId('grw-chat-integration-connection-health'),
    ).toHaveTextContent('connected');
  });

  it('shows the encryption-key-unconfigured warning and disables the pairing form', async () => {
    stubApi({ encryptionConfigured: false, relations: [] });

    renderScreen();

    expect(
      await screen.findByText(/encryption key is not configured/i),
    ).toBeInTheDocument();
    const submitButton = await screen.findByRole('button', { name: /pair/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByLabelText(/registration code/i)).toBeDisabled();
  });

  it('submits the pairing form with the entered fields when the key is configured', async () => {
    stubApi({ encryptionConfigured: true, relations: [] });
    mocks.apiv3Post.mockResolvedValue({
      data: { status: 'paired', relationId: 'relation-new' },
    });
    const user = userEvent.setup();

    renderScreen();

    await user.type(
      await screen.findByLabelText(/registration code/i),
      'the-code',
    );
    await user.type(
      screen.getByLabelText(/proxy url/i),
      'https://proxy.example.test',
    );
    await user.type(
      screen.getByLabelText(/this growi's url/i),
      'https://growi.example.test',
    );
    await user.type(
      screen.getByLabelText(/label to show the chat service/i),
      'My GROWI',
    );
    await user.click(screen.getByRole('button', { name: /pair/i }));

    await waitFor(() => {
      expect(mocks.apiv3Post).toHaveBeenCalledWith(
        '/chat-integration/admin/pairing',
        {
          registrationCode: 'the-code',
          proxyUri: 'https://proxy.example.test',
          growiUri: 'https://growi.example.test',
          growiLabel: 'My GROWI',
        },
      );
    });
    expect(mocks.toastSuccess).toHaveBeenCalled();
  });

  it('shows an error toast (not a success) for a non-"paired" outcome', async () => {
    stubApi({ encryptionConfigured: true, relations: [] });
    mocks.apiv3Post.mockResolvedValue({
      data: { status: 'code-expired' },
    });
    const user = userEvent.setup();

    renderScreen();

    await user.type(
      await screen.findByLabelText(/registration code/i),
      'the-code',
    );
    await user.type(
      screen.getByLabelText(/proxy url/i),
      'https://proxy.example.test',
    );
    await user.type(
      screen.getByLabelText(/this growi's url/i),
      'https://growi.example.test',
    );
    await user.type(
      screen.getByLabelText(/label to show the chat service/i),
      'My GROWI',
    );
    await user.click(screen.getByRole('button', { name: /pair/i }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalled();
    });
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });
});
