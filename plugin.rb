# frozen_string_literal: true

# name: discourse-kuu-new-topic
# about: 统一处理「新建话题」按钮：各 KUU 插件登记自己的发帖类型（评分主题、二手市场等），按分类直接打开对应的表单，或者弹出选择框
# version: 0.0.1
# authors: DAVVVVVVVVVVVID
# url: https://github.com/DAVVVVVVVVVVVID/discourse-kuu-new-topic
# required_version: 2026.1.0

register_asset "stylesheets/common/kuu-new-topic.scss"

module ::DiscourseKuuNewTopic
  PLUGIN_NAME = "discourse-kuu-new-topic"
end
