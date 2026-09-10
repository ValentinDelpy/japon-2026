import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'home' | 'pin' | 'map' | 'calendar' | 'book' | 'chart' | 'backpack' | 'check' | 'train'
  | 'compass' | 'utensils' | 'message' | 'flag' | 'image' | 'camera' | 'sun' | 'info'
  | 'dice' | 'printer' | 'search' | 'menu' | 'close' | 'chevron' | 'external' | 'refresh'
  | 'moon' | 'flower' | 'bed' | 'ticket' | 'gift' | 'user' | 'logout' | 'plus' | 'route'
  | 'sparkles' | 'clock' | 'wallet' | 'cloud';

/** Icônes SVG inline (trait 1.8, 24px). Aucun emoji comme icône. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (name()) {
        @case ('home') { <path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/> }
        @case ('pin') { <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/> }
        @case ('map') { <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/> }
        @case ('route') { <circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h6a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h7"/> }
        @case ('calendar') { <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/> }
        @case ('book') { <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5z"/><path d="M8 3v18"/> }
        @case ('chart') { <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/> }
        @case ('backpack') { <path d="M6 9a6 6 0 0 1 12 0v11H6V9z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/><path d="M9 15h6"/> }
        @case ('check') { <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/> }
        @case ('train') { <rect x="5" y="3" width="14" height="13" rx="2"/><path d="M8 19l-2 3M16 19l2 3M5 11h14"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/> }
        @case ('compass') { <circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11z"/> }
        @case ('utensils') { <path d="M4 3v7a3 3 0 0 0 6 0V3M7 10v11"/><path d="M17 3c-1.5 2-2 4-2 6 0 1.5.5 2 2 2v10"/> }
        @case ('message') { <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/> }
        @case ('flag') { <path d="M5 3v18"/><path d="M5 4h13l-2 4 2 4H5"/> }
        @case ('image') { <rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/> }
        @case ('camera') { <path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/> }
        @case ('sun') { <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/> }
        @case ('cloud') { <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6 1.4A3.5 3.5 0 0 1 17 18H7z"/> }
        @case ('info') { <circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/> }
        @case ('dice') { <rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><circle cx="12" cy="12" r="1"/> }
        @case ('printer') { <path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/> }
        @case ('search') { <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/> }
        @case ('menu') { <path d="M4 7h16M4 12h16M4 17h16"/> }
        @case ('close') { <path d="M6 6l12 12M18 6 6 18"/> }
        @case ('chevron') { <path d="M9 6l6 6-6 6"/> }
        @case ('external') { <path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/> }
        @case ('refresh') { <path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/> }
        @case ('moon') { <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/> }
        @case ('flower') { <circle cx="12" cy="12" r="2"/><path d="M12 3c2 3 2 6 0 9-2-3-2-6 0-9zM12 21c-2-3-2-6 0-9 2 3 2 6 0 9zM3 12c3-2 6-2 9 0-3 2-6 2-9 0zM21 12c-3 2-6 2-9 0 3-2 6-2 9 0z"/> }
        @case ('bed') { <path d="M3 18V7M3 12h18v6M21 18v-6a2 2 0 0 0-2-2h-6v2"/><circle cx="7" cy="10" r="2"/> }
        @case ('ticket') { <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M12 6v12"/> }
        @case ('gift') { <rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13"/><path d="M12 8S10 3 7.5 4.5 9 8 12 8zM12 8s2-5 4.5-3.5S15 8 12 8z"/> }
        @case ('user') { <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/> }
        @case ('logout') { <path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 17l-5-5 5-5M5 12h11"/> }
        @case ('plus') { <path d="M12 5v14M5 12h14"/> }
        @case ('sparkles') { <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/> }
        @case ('clock') { <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/> }
        @case ('wallet') { <rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="15" r="1.2"/> }
      }
    </svg>
  `,
  styles: [':host { display: inline-flex; align-items: center; justify-content: center; }'],
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(18);
}
