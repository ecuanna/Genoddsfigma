interface SponsoredBannerProps {
  title: string;
  description: string;
  buttonText: string;
  logoUrl?: string;
  isDarkMode?: boolean;
}

export function SponsoredBanner({
  title,
  description,
  buttonText,
  logoUrl,
  isDarkMode = false,
}: SponsoredBannerProps) {
  const containerClass = isDarkMode
    ? "bg-[#141414] border-[#2a2a2a]"
    : "bg-gray-100 border-gray-200";

  const labelClass = isDarkMode ? "text-gray-500" : "text-gray-500";
  const placeholderClass = isDarkMode ? "text-gray-600" : "text-gray-400";

  return (
    <div className="w-full flex justify-center">
      {/* Desktop: 970x90 Leaderboard */}
      <div
        className={`hidden lg:block w-[970px] h-[90px] rounded-lg shadow-lg overflow-hidden border ${containerClass}`}
      >
        <div className="flex flex-col items-center justify-center h-full px-6">
          <span className={`text-[10px] ${labelClass} mb-1`}>Reklam</span>
          <div className={`text-center ${placeholderClass} text-sm`}>
            Google Ads 970x90
          </div>
          {/* 
            Google Ads integration:
            Replace this placeholder with your actual ad unit code.
            Example:
            <ins className="adsbygoogle"
              style={{ display: "inline-block", width: 970, height: 90 }}
              data-ad-client="ca-pub-XXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
            />
          */}
        </div>
      </div>

      {/* Tablet: 728x90 Leaderboard */}
      <div
        className={`hidden md:block lg:hidden w-[728px] h-[90px] rounded-lg shadow-lg overflow-hidden border ${containerClass}`}
      >
        <div className="flex flex-col items-center justify-center h-full px-4">
          <span className={`text-[10px] ${labelClass} mb-1`}>Reklam</span>
          <div className={`text-center ${placeholderClass} text-sm`}>
            Google Ads 728x90
          </div>
        </div>
      </div>

      {/* Mobile: 320x50 Banner */}
      <div
        className={`block md:hidden w-[320px] h-[50px] rounded-lg shadow-lg overflow-hidden border ${containerClass}`}
      >
        <div className="flex flex-col items-center justify-center h-full px-3">
          <span className={`text-[9px] ${labelClass} mb-0.5`}>Reklam</span>
          <div className={`text-center ${placeholderClass} text-[10px]`}>
            Google Ads 320x50
          </div>
        </div>
      </div>
    </div>
  );
}
