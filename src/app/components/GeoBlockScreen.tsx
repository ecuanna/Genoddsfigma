import { ShieldOff, Globe, Mail } from "lucide-react";
import { motion } from "motion/react";

interface GeoBlockScreenProps {
  isDarkMode?: boolean;
}

export function GeoBlockScreen({ isDarkMode = false }: GeoBlockScreenProps) {
  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? "bg-[#0d0d0d]" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header className="bg-[#022179] py-4 px-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-white/80" />
          <span className="text-white font-bold text-xl tracking-tight">GENODDS</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`w-full max-w-lg rounded-2xl shadow-xl overflow-hidden ${
            isDarkMode ? "bg-[#141414] border border-[#2a2a2a]" : "bg-white border border-gray-100"
          }`}
        >
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-[#022179] via-blue-500 to-[#022179]" />

          <div className="p-8 sm:p-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <ShieldOff className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* English block */}
            <div className="mb-8 text-center">
              <h1
                className={`text-2xl font-bold mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Service Unavailable in Your Region
              </h1>
              <p
                className={`text-sm leading-relaxed mb-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                GENODDS is not available to users accessing from <strong>Turkey</strong> due to legal and regulatory requirements. 
                Access from this region has been restricted in accordance with our{" "}
                <span className="text-[#022179] font-medium">Terms of Service</span> and applicable law.
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                The use of VPN, proxy, DNS routing, or other tools to circumvent this restriction is strictly prohibited
                and may result in permanent account suspension.
              </p>
            </div>

            {/* Divider */}
            <div className={`flex items-center gap-3 mb-8 ${isDarkMode ? "text-gray-700" : "text-gray-300"}`}>
              <div className="flex-1 h-px bg-current opacity-50" />
              <span className={`text-xs ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>TR</span>
              <div className="flex-1 h-px bg-current opacity-50" />
            </div>

            {/* Turkish block */}
            <div className="text-center">
              <h2
                className={`text-xl font-bold mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Bu Bölgede Hizmet Sunulmuyor
              </h2>
              <p
                className={`text-sm leading-relaxed mb-4 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                GENODDS, yasal ve düzenleyici gereklilikler nedeniyle <strong>Türkiye</strong>'den erişen kullanıcılara 
                hizmet sunamamaktadır. Bu bölgeden erişim, Kullanıcı Sözleşmemiz ve yürürlükteki mevzuat çerçevesinde kısıtlanmıştır.
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                VPN, proxy, DNS yönlendirmesi veya bu kısıtlamayı aşmaya yönelik herhangi bir araç kullanımı kesinlikle yasaktır
                ve kalıcı hesap askıya almayla sonuçlanabilir.
              </p>
            </div>

            {/* Contact */}
            <div
              className={`mt-8 p-4 rounded-xl flex items-center gap-3 ${
                isDarkMode ? "bg-[#1a1a1a] border border-[#2a2a2a]" : "bg-gray-50 border border-gray-200"
              }`}
            >
              <Mail className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
              <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                Questions? Contact us at{" "}
                <a
                  href="mailto:legal@genodds.com"
                  className="text-[#022179] hover:underline font-medium"
                >
                  legal@genodds.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-[#022179] py-5 px-4 text-center">
        <p className="text-white/40 text-xs">
          &copy; 2026 GENODDS. All rights reserved. &nbsp;·&nbsp; Tüm hakları saklıdır.
        </p>
        <p className="text-white/25 text-[10px] mt-1">
          Access restricted — GEO-TR-BLOCK
        </p>
      </footer>
    </div>
  );
}
