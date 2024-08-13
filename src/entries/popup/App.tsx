import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [useProxy, setUseProxy] = useState(false);
  const [proxyUrl, setProxyUrl] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState("en");

  useEffect(() => {
    // 从存储中加载设置
    chrome.storage.sync.get(["openaiApiKey", "useProxy", "proxyUrl", "defaultLanguage"], (result) => {
      if (result.openaiApiKey) setApiKey(result.openaiApiKey);
      if (result.useProxy !== undefined) setUseProxy(result.useProxy);
      if (result.proxyUrl) setProxyUrl(result.proxyUrl);
      if (result.defaultLanguage) setDefaultLanguage(result.defaultLanguage);
    });
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({ 
      openaiApiKey: apiKey,
      useProxy: useProxy,
      proxyUrl: proxyUrl,
      defaultLanguage: defaultLanguage
    }, () => {
      alert("设置已保存");
    });
  };

  const clearSettings = () => {
    setApiKey("");
    setUseProxy(false);
    setProxyUrl("");
    setDefaultLanguage("en");
    chrome.storage.sync.remove(["openaiApiKey", "useProxy", "proxyUrl", "defaultLanguage"], () => {
      alert("设置已清除");
      console.log("设置已清除");
    });
  };

  return (
    <main className="min-w-[400px] min-h-[220px] bg-zinc-900 text-white p-4">
      <h1 className="text-xl font-bold mb-4">配置OpenAI API</h1>
      <div className="relative mb-4">
        <Input
          type={showApiKey ? "text" : "password"}
          value={apiKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
          placeholder="输入您的OpenAI API密钥"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowApiKey(!showApiKey)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
        >
          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <label htmlFor="use-proxy">使用我自己的网址</label>
				<Switch
          checked={useProxy}
          onCheckedChange={setUseProxy}
          id="use-proxy"
        />
      </div>
      {useProxy && (
        <Input
          type="text"
          value={proxyUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProxyUrl(e.target.value)}
          placeholder="https://api.openai.com"
          className="mb-4"
        />
      )}
      <div className="mb-4">
  <label htmlFor="default-language" className="block mb-2 text-sm font-medium">默认翻译语言</label>
  <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="选择默认语言" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="en">英语</SelectItem>
      <SelectItem value="zh">中文</SelectItem>
      <SelectItem value="es">西班牙语</SelectItem>
      <SelectItem value="fr">法语</SelectItem>
      <SelectItem value="de">德语</SelectItem>
      <SelectItem value="ja">日语</SelectItem>
      <SelectItem value="ko">韩语</SelectItem>
    </SelectContent>
  </Select>
</div>
      <div className="flex space-x-2">
        <Button onClick={saveSettings}>保存</Button>
        <Button onClick={clearSettings} variant="outline">
          清除
        </Button>
      </div>
    </main>
  );
}

export default App;