import { assetUrl } from "@/lib/urls";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <strong className="site-footer-brand">YBrary</strong>
        <a href={assetUrl("/notices/analytics.html")} target="_blank" rel="noreferrer">
          방문 통계 안내
        </a>
        <a href={assetUrl("/notices/maplestory-font.txt")} target="_blank" rel="noreferrer">
          메이플스토리 서체 저작권 안내
        </a>
      </div>
    </footer>
  );
}
