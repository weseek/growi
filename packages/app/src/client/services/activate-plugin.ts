import { CustomWindow } from '~/interfaces/global';

export class ActivatePluginService {

  static activateAll(): void {
    const { pluginActivators } = window as CustomWindow;
    Object.entries(pluginActivators).forEach(([, activator]) => {
      activator.activate();
    });
  }

}
