import Service from "@ember/service";

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
}
