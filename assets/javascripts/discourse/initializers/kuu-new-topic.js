import { withPluginApi } from "discourse/lib/plugin-api";
import NewTopicChoice from "../components/kuu-new-topic/modal/new-topic-choice";

export default {
  name: "kuu-new-topic",

  initialize(container) {
    if (!container.lookup("service:current-user")) {
      return;
    }

    const registry = container.lookup("service:kuu-new-topic");
    const modal = container.lookup("service:modal");

    withPluginApi((api) => {
      api.registerValueTransformer(
        "can-create-topic-button",
        ({ value, context }) =>
          value || !!registry.typeForCategory(context.category)?.forceButton
      );

      api.registerBehaviorTransformer(
        "create-topic-button-click",
        ({ next, context }) => {
          const ownType = registry.typeForCategory(context.category);
          if (ownType) {
            return ownType.open({ ...context, createTopic: next });
          }

          const types = registry.chooserTypes(context);
          if (types.length === 0) {
            return next();
          }

          modal.show(NewTopicChoice, {
            model: { types, context, createTopic: next },
          });
        }
      );
    });
  },
};
