import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContentService } from './core/content.service';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly theme = inject(ThemeService);
  private readonly content = inject(ContentService);

  constructor() {
    this.theme.init();
    void this.content.load();
  }
}
