import { Routes } from '@angular/router';
import { Shell } from './layout/shell';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage) },
      { path: 'itinerary', loadComponent: () => import('./features/itinerary/itinerary-page').then((m) => m.ItineraryPage) },
      { path: 'timeline', loadComponent: () => import('./features/timeline/timeline-page').then((m) => m.TimelinePage) },
      { path: 'sheets', loadComponent: () => import('./features/travel-sheets/travel-sheets-page').then((m) => m.TravelSheetsPage) },
      { path: 'statistics', loadComponent: () => import('./features/statistics/statistics-page').then((m) => m.StatisticsPage) },
      { path: 'packing', loadComponent: () => import('./features/packing/packing-page').then((m) => m.PackingPage) },
      { path: 'checklist', loadComponent: () => import('./features/checklist/checklist-page').then((m) => m.ChecklistPage) },
      { path: 'logistics', loadComponent: () => import('./features/logistics/logistics-page').then((m) => m.LogisticsPage) },
      { path: 'restaurants', loadComponent: () => import('./features/restaurants/restaurants-page').then((m) => m.RestaurantsPage) },
      { path: 'phrasebook', loadComponent: () => import('./features/phrasebook/phrasebook-page').then((m) => m.PhrasebookPage) },
      { path: 'culture', loadComponent: () => import('./features/culture/culture-page').then((m) => m.CulturePage) },
      { path: 'moodboard', loadComponent: () => import('./features/moodboard/moodboard-page').then((m) => m.MoodboardPage) },
      { path: 'photos', loadComponent: () => import('./features/photos/photos-page').then((m) => m.PhotosPage) },
      { path: 'weather', loadComponent: () => import('./features/weather/weather-page').then((m) => m.WeatherPage) },
      { path: 'japan-101', loadComponent: () => import('./features/japan-101/japan-101-page').then((m) => m.Japan101Page) },
      { path: 'surprise', loadComponent: () => import('./features/surprise/surprise-page').then((m) => m.SurprisePage) },
      { path: 'print', loadComponent: () => import('./features/print/print-page').then((m) => m.PrintPage) },
    ],
  },
  { path: 'admin/login', loadComponent: () => import('./admin/login/login-page').then((m) => m.LoginPage) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', loadComponent: () => import('./admin/overview/overview-page').then((m) => m.OverviewPage) },
      { path: 'trip', loadComponent: () => import('./admin/trip/trip-page').then((m) => m.TripPage) },
      { path: 'days', loadComponent: () => import('./admin/days/days-page').then((m) => m.DaysPage) },
      { path: 'activities', loadComponent: () => import('./admin/activities/activities-page').then((m) => m.ActivitiesPage) },
      { path: 'stops', loadComponent: () => import('./admin/stops/stops-page').then((m) => m.StopsPage) },
      { path: 'reservations', loadComponent: () => import('./admin/reservations/reservations-page').then((m) => m.ReservationsPage) },
      { path: 'content', loadComponent: () => import('./admin/content/content-page').then((m) => m.ContentPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];
