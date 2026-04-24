import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastHostComponent } from './shared/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('gym-platform-admin');
}
