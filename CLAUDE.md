# discourse-kuu-new-topic（给 Claude Code）

## 这是什么
- 京大中文论坛（KUU，Discourse 自托管）的「新建话题」入口插件，只有前端代码。规则和登记接口见 `README.md`
- 来由（2026-10-18 David 定）：评分插件和二手市场插件都要接管「新建话题」按钮，各自拦截时要靠加载顺序排先后，容易出错。改成由本插件统一处理，其他插件只登记发帖类型，以后加类似功能可以复用
- 使用方：`discourse-kuu-ratings`（评分主题）、`discourse-kuu-market`（出售 / 求购，只在二手市场分类里直接打开表单，不进选择框）
- 论坛的运维记录、上线记录在另一个私有仓库（Windows 上的 `D:\PROJECT\KUU`，GitHub `kuu-forum`），部署由 KUU 那边负责，必须先得到 David 的同意
- 本仓库是**公开**的：不要提交任何密钥、敏感信息、用户数据

## 约定
- 改登记接口（`register` 的参数和行为）要同步改 README，并考虑评分、二手市场两个插件是否要跟着改
- 不加插件开关：评分和二手市场依赖它，关掉会让它们的表单打不开
- 面向用户的文案放在 `config/locales/`（zh_CN 和 en 都要有）
- 每个行为都要有 QUnit 验收测试（`test/javascripts/acceptance`）
- 提交信息用中文；推送前先跑测试；推到 main 之后 GitHub CI 要全部通过
- 用中文交流

## 开发环境
- 本仓库位于 WSL 的 `~/discourse/plugins/discourse-kuu-new-topic`，Discourse 源码在 `~/discourse`（官方仓库，不要改）。常用命令（`d/boot_dev`、`d/dev`、`d/rspec`、lint）和注意事项同评分插件的 `CLAUDE.md`
- QUnit 默认连 `d/dev` 起的开发服务器；没开的话加 `--standalone`
- 容器里没装 Chrome，`bin/qunit` 会报 `Chrome is not installed`。可以借用 system spec 的 Playwright Chromium：
  ```bash
  mkdir -p ~/discourse/tmp/kuu-chrome-bin
  ln -sf /home/discourse/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome ~/discourse/tmp/kuu-chrome-bin/google-chrome
  docker exec -u discourse -w /src -e DISCOURSE_DISABLE_BROWSER_SANDBOX=1 discourse_dev bash -lc \
    'export PATH=/src/tmp/kuu-chrome-bin:$PATH; bin/qunit --standalone plugins/discourse-kuu-new-topic/test/javascripts'
  ```
  Playwright 升级后 `chromium-1248` 的版本号会变
- 本地 `pnpm lint:types` 会在 glint 内部崩溃（`Cannot read properties of undefined (reading 'fileExists')`），评分插件也一样，是本地工具链的问题；类型检查以 GitHub CI 为准
