import { CustomWindow } from '~/interfaces/global';

export class ActivatePluginService {

  static activateAll(): void {
    const { activators } = window as CustomWindow;
    Object.entries(activators).forEach(([, activator]) => {
      activator.activate();
    });
  }

}
