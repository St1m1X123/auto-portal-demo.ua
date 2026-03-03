"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logSiteVisit } from '@/utils/supabase';

/**
 * Відстежує візити на сайт.
 * Використовує sessionStorage, щоб рахувати 1 візит за сесію (до закриття вкладки).
 */
export default function AnalyticsTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Не рахуємо візити в адмінку як клієнтські візити
        if (pathname?.startsWith('/admin')) return;

        const hasLoggedVisit = sessionStorage.getItem('site_visit_logged');

        if (!hasLoggedVisit) {
            logSiteVisit();
            sessionStorage.setItem('site_visit_logged', 'true');
        }
    }, [pathname]);

    return null; // Компонент нічого не рендерить
}
