# AGENTS.md

本项目由同一人在两台电脑间交替开发，通过 GitHub 同步。

## 目录归属

- `src/` 和 `index.html`：归主力机（程序）修改，文本机不许改。
- `content/`：归文本机（剧本和文本）修改，主力机不许改。
- `docs/contract.md`：两边都只读，要改必须先问我。
- `assets/`：两边都可以放，不归属某一台机器。素材最终接入游戏由主力机负责。
- `AGENTS.md` 和 `.gitignore`：禁止自动修改。

## 会话开始

1. 执行 `git pull`。
2. 读取 `docs/state.md` 最近 3 条和 `docs/contract.md`。

## 会话结束

1. 执行 `git add .`。
2. 执行 `git commit -m "简短说明"`。
3. 执行 `git push`。
4. 在 `docs/state.md` 追加记录。

## 约束

- 不许写入 API Key，密钥放 `.env`。
- 不许擅自装新依赖包。
- 一次只做一个功能，做完等我验证。