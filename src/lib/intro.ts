/** sessionStorage key: the intro plays once per browser session. */
export const INTRO_KEY = "nuven-intro-seen";

/**
 * Runs in <head> before the page paints, so the intro overlay is either shown
 * from the very first frame or never shown at all (no flash of the site first).
 * Skipped for people who prefer reduced motion and for repeat views in a session.
 */
export const INTRO_BOOT = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem("${INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("intro-active")}catch(e){}})();`;
