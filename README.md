# discourse-kuu-new-topic

京大中文论坛（KUU）的「新建话题」入口插件。评分、二手市场这类有自己发帖表单的 KUU 插件，都通过它接管「新建话题」按钮，不再各自拦截。

## 规则

- 只有本插件处理 core 的 `create-topic-button-click` 和 `can-create-topic-button` 两个转换器。其他 KUU 插件**不要**再注册这两个转换器，改为向本插件登记「发帖类型」
- 在某个类型**专属的分类**里点「新建话题」：直接打开这个类型的表单，不弹选择框
- 在其他地方点「新建话题」：如果有类型愿意出现在选择框里，弹出选择框（第一项固定是「话题」，即普通编辑器）；没有的话直接打开普通编辑器
- 未登录用户不受影响
- 登记不依赖插件加载顺序：按钮被点击时才读取登记表

## 登记一个发帖类型

在插件自己的初始化器里：

```js
const newTopic = container.lookup("service:kuu-new-topic");

newTopic?.register({
  id: "kuu-market",                          // 唯一，用插件名开头
  label: "kuu_market.new_topic.label",       // 选择框里的标题（翻译 key）
  description: "kuu_market.new_topic.description", // 选择框里的说明（翻译 key）
  icon: "cart-shopping",
  categoryIds: () => [marketCategoryId],     // 专属分类，可以为空
  inChooser: false,                          // 是否出现在其他地方的选择框里；也可以是 ({ category, tag }) => boolean
  forceButton: false,                        // 专属分类里只开放回复时，仍给登录用户显示按钮
  order: 0,                                  // 选择框里的顺序，小的在前
  open: ({ category, tag, createTopic }) => {
    // 打开自己的表单；createTopic() 打开普通编辑器
  },
});
```

- `categoryIds` 是函数，每次点击时求值，站点设置改了不用刷新登记
- 同一个 `id` 再登记一次会覆盖前一次
- 插件开关关闭时不要登记

## 依赖

用到本插件的 KUU 插件在仓库根目录放 `about.json`，让 GitHub CI 测试时一起安装本插件：

```json
{
  "tests": {
    "requiredPlugins": ["https://github.com/DAVVVVVVVVVVVID/discourse-kuu-new-topic"]
  }
}
```

线上部署时，本插件要和依赖它的插件一起装上。少了它，那些插件的表单从「新建话题」按钮打不开。

## 已知限制

- 分类卡片弹窗上的「新建话题」按钮直接打开普通编辑器，不经过 core 的转换器。需要拦截普通编辑器的插件（比如二手市场）要在后端拦截
- 在普通编辑器里把分类改成某个类型的专属分类，也不会切换到表单，同样靠后端拦截

## 测试

```bash
# 在 ~/discourse 下；容器里没有 Chrome 时见 CLAUDE.md
d/exec bin/qunit plugins/discourse-kuu-new-topic/test/javascripts
d/rspec plugins/discourse-kuu-new-topic/spec
```

## 许可证

MIT
