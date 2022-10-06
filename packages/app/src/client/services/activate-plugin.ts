import { CustomWindow } from '~/interfaces/global';

export class ActivatePluginService {

  static activateAll(): void {
    const { pluginActivators } = window as CustomWindow;

    if (pluginActivators == null) {
      return;
    }

    Object.entries(pluginActivators).forEach(([, activator]) => {
      activator.activate();
    });
  }

}
