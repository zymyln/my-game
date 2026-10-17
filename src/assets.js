export class AssetLibrary {
  constructor() { this.portraits = new Map(); this.backgrounds = new Map(); this.objects = new Map(); }
  async load() {
    try {
      const response = await fetch(new URL('../assets/manifest.json', import.meta.url));
      if (!response.ok) throw new Error('找不到素材清单');
      const manifest = await response.json();
      await Promise.all(['portraits','backgrounds','objects'].flatMap(category => Object.entries(manifest[category] || {}).map(async ([name, path]) => {
        if (typeof path !== 'string' || !path) return;
        const url = new URL(path, new URL('../assets/', import.meta.url));
        if (url.origin !== location.origin) return;
        const image = await new Promise(resolve => {
          const item = new Image();
          const timeout = setTimeout(() => resolve(null), 5000);
          item.onload = () => { clearTimeout(timeout); resolve(item); };
          item.onerror = () => { clearTimeout(timeout); resolve(null); };
          item.src = url.href;
        });
        if (image) this[category].set(name, image);
      })));
    } catch (error) {
      console.warn('素材清单读取失败，继续使用占位美术。', error.message);
    }
  }
  portrait(name) {
    if (this.portraits.has(name)) return this.portraits.get(name);
    const actor = name.split('_')[0];
    const pose=name.split('_').slice(0,2).join('_');
    if(this.portraits.has(pose))return this.portraits.get(pose);
    const neutral={elaina:'elaina_standing',emil:'emil_neutral',nino:'nino_down',chief:'chief_calm'}[actor];
    return this.portraits.get(neutral) ?? [...this.portraits.entries()].sort(([a],[b])=>a.localeCompare(b)).find(([key]) => key.startsWith(`${actor}_`))?.[1] ?? null;
  }
}
