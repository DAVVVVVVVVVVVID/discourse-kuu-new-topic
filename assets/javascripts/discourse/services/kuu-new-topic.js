import Service, { service } from "@ember/service";
import NewTopicChoice from "../components/kuu-new-topic/modal/new-topic-choice";

/**
 * @typedef {object} KuuTopicType
 * @property {string} id Unique id, namespaced by the registering plugin.
 * @property {string} label Translation key for the option title in the chooser.
 * @property {string} description Translation key for the option description.
 * @property {string} icon
 * @property {(context: object) => void} open Opens the type's form. Receives the
 *   button's `category` and `tag`, and `createTopic` to fall back to the composer.
 * @property {() => number[]} [categoryIds] Categories that belong to this type: the
 *   button opens the form directly there, without the chooser.
 * @property {boolean | ((context: object) => boolean)} [inChooser] Offers the type in
 *   the chooser outside its own categories.
 * @property {boolean} [forceButton] Shows the button in the type's own categories to
 *   every logged-in user, for categories where users may only reply.
 * @property {number} [order] Position in the chooser; lower comes first.
 */

/**
 * Registry of topic types that open their own form instead of the composer.
 */
export default class KuuNewTopic extends Service {
  @service composer;
  @service modal;

  #types = new Map();

  /** @returns {KuuTopicType[]} */
  get types() {
    return [...this.#types.values()].sort(
      (a, b) => a.order - b.order || a.id.localeCompare(b.id)
    );
  }

  /**
   * Registering an id again replaces the earlier type.
   *
   * @param {KuuTopicType} type
   */
  register(type) {
    this.#types.set(type.id, {
      categoryIds: () => [],
      inChooser: false,
      forceButton: false,
      order: 0,
      ...type,
    });
  }

  /**
   * @param {object} [category]
   * @returns {KuuTopicType | undefined}
   */
  typeForCategory(category) {
    if (!category) {
      return;
    }

    return this.types.find((type) => type.categoryIds().includes(category.id));
  }

  /**
   * @param {object} context The button's `category` and `tag`.
   * @returns {KuuTopicType[]}
   */
  chooserTypes(context) {
    return this.types.filter((type) =>
      typeof type.inChooser === "function"
        ? type.inChooser(context)
        : type.inChooser
    );
  }

  /**
   * What happens when a user asks for a new topic: a type's own category opens
   * its form directly; elsewhere the chooser offers a topic and the types that
   * want to appear; with no such types the composer opens straight away.
   * Used by core's create-topic button and by `openNewTopic`.
   *
   * @param {object} context `category` and `tag` where the user is.
   * @param {() => void} createTopic Opens the ordinary composer.
   */
  start(context, createTopic) {
    const ownType = this.typeForCategory(context.category);
    if (ownType) {
      return ownType.open({ ...context, createTopic });
    }

    const types = this.chooserTypes(context);
    if (types.length === 0) {
      return createTopic();
    }

    this.modal.show(NewTopicChoice, {
      model: { types, context, createTopic },
    });
  }

  /**
   * Same as clicking core's create-topic button, for pages that do not have one
   * (for example a theme's mobile bottom bar). The caller handles logged-out users.
   *
   * @param {object} [context] `category` and `tag` where the user is.
   */
  openNewTopic({ category, tag } = {}) {
    const context = { category, tag };
    this.start(context, () =>
      // core 的 filterTags 要的是逗号分隔的字符串（或 listTag 查询结果），传数组会在
      // 非管理员身上报 "Cannot read properties of undefined (reading 'filter')"，编辑器打不开
      this.composer.openNewTopic({
        category,
        tags: tag?.id,
      })
    );
  }
}
