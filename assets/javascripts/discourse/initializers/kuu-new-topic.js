import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "kuu-new-topic",

  initialize(container) {
    if (!container.lookup("service:current-user")) {
      return;
    }

    const registry = container.lookup("service:kuu-new-topic");

    withPluginApi((api) => {
      api.registerValueTransformer(
        "can-create-topic-button",
        ({ value, context }) =>
          value || !!registry.typeForCategory(context.category)?.forceButton
      );

      api.registerBehaviorTransformer(
        "create-topic-button-click",
        ({ next, context }) => registry.start(context, next)
      );
    });
  },
};
