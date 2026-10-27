import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { filter, interval } from 'rxjs';

const UPDATE_CHECK_INTERVAL_MS = 10 * 60 * 1000;

export function provideAutomaticUpdates(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const updates = inject(SwUpdate);
    if (!updates.isEnabled) {
      return;
    }
    updates.versionUpdates.pipe(filter((event) => event.type === 'VERSION_READY')).subscribe(() => document.location.reload());
    updates.unrecoverable.subscribe(() => document.location.reload());
    interval(UPDATE_CHECK_INTERVAL_MS).subscribe(() => updates.checkForUpdate());
  });
}
