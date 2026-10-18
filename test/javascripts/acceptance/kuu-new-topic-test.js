import { click, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

const BUG_CATEGORY_ID = 1;

function registerType(owner, type) {
  owner.lookup("service:kuu-new-topic").register({
    label: "kuu_new_topic.choice.topic",
    description: "kuu_new_topic.choice.topic_description",
    icon: "star",
    ...type,
  });
}

acceptance("KUU new topic", function (needs) {
  needs.user();

  test("opens the composer when no type applies", async function (assert) {
    registerType(this.owner, {
      id: "elsewhere",
      categoryIds: () => [9999],
      open: () => assert.step("opened"),
    });

    await visit("/latest");
    await click("#create-topic");

    assert.verifySteps([]);
    assert.dom(".kuu-new-topic-choice").doesNotExist();
    assert.dom("#reply-control.open").exists();
  });

  test("opens a type's form straight from its own category", async function (assert) {
    registerType(this.owner, {
      id: "market",
      categoryIds: () => [BUG_CATEGORY_ID],
      inChooser: true,
      open: ({ category }) => assert.step(`market:${category.id}`),
    });

    await visit("/c/bug/1");
    await click("#create-topic");

    assert.verifySteps([`market:${BUG_CATEGORY_ID}`]);
    assert.dom(".kuu-new-topic-choice").doesNotExist();
    assert.dom("#reply-control.open").doesNotExist();
  });

  test("lets the user choose between a topic and the offered types", async function (assert) {
    registerType(this.owner, {
      id: "board",
      inChooser: true,
      order: 2,
      open: () => assert.step("board"),
    });
    registerType(this.owner, {
      id: "poll",
      inChooser: true,
      order: 1,
      open: () => assert.step("poll"),
    });
    registerType(this.owner, {
      id: "hidden",
      inChooser: ({ category }) => category?.id === BUG_CATEGORY_ID,
      open: () => assert.step("hidden"),
    });

    await visit("/latest");
    await click("#create-topic");

    assert
      .dom(".kuu-new-topic-choice__option")
      .exists({ count: 3 }, "offers a topic and the two types");
    assert
      .dom(".kuu-new-topic-choice__option:nth-child(2)")
      .hasAttribute("data-type-id", "poll", "orders the types");

    await click(".kuu-new-topic-choice__option[data-type-id='board']");

    assert.verifySteps(["board"]);
    assert.dom(".kuu-new-topic-choice").doesNotExist();
  });

  test("falls back to the composer from the chooser", async function (assert) {
    registerType(this.owner, {
      id: "board",
      inChooser: true,
      open: () => assert.step("board"),
    });

    await visit("/latest");
    await click("#create-topic");
    await click(".kuu-new-topic-choice__option.--topic");

    assert.verifySteps([]);
    assert.dom(".kuu-new-topic-choice").doesNotExist();
    assert.dom("#reply-control.open").exists();
  });

  test("passes the composer fallback to the type", async function (assert) {
    registerType(this.owner, {
      id: "market",
      categoryIds: () => [BUG_CATEGORY_ID],
      open: ({ createTopic }) => createTopic(),
    });

    await visit("/c/bug/1");
    await click("#create-topic");

    assert.dom("#reply-control.open").exists();
  });
});

acceptance("KUU new topic | reply-only categories", function (needs) {
  needs.user({ can_create_topic: false });

  test("shows the button in a type's own category when asked to", async function (assert) {
    registerType(this.owner, {
      id: "board",
      categoryIds: () => [BUG_CATEGORY_ID],
      forceButton: true,
      open: () => {},
    });

    await visit("/latest");
    assert.dom("#create-topic").doesNotExist();

    await visit("/c/bug/1");
    assert.dom("#create-topic").exists();
  });
});
