import Component from "@glimmer/component";
import { fn } from "@ember/helper";
import { action } from "@ember/object";
import DButton from "discourse/ui-kit/d-button";
import DModal from "discourse/ui-kit/d-modal";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";

export default class NewTopicChoice extends Component {
  @action
  chooseTopic() {
    this.args.closeModal();
    this.args.model.createTopic();
  }

  @action
  chooseType(type) {
    const { context, createTopic } = this.args.model;
    this.args.closeModal();
    type.open({ ...context, createTopic });
  }

  <template>
    <DModal
      class="kuu-new-topic-choice"
      @closeModal={{@closeModal}}
      @title={{i18n "kuu_new_topic.choice.title"}}
    >
      <:body>
        <div class="kuu-new-topic-choice__options">
          <DButton
            class="btn-default kuu-new-topic-choice__option --topic"
            @action={{this.chooseTopic}}
          >
            {{dIcon "far-comments" class="kuu-new-topic-choice__icon"}}
            <span class="kuu-new-topic-choice__text">
              <span class="kuu-new-topic-choice__label">
                {{i18n "kuu_new_topic.choice.topic"}}
              </span>
              <span class="kuu-new-topic-choice__description">
                {{i18n "kuu_new_topic.choice.topic_description"}}
              </span>
            </span>
          </DButton>
          {{#each @model.types as |type|}}
            <DButton
              class="btn-default kuu-new-topic-choice__option"
              data-type-id={{type.id}}
              @action={{fn this.chooseType type}}
            >
              {{dIcon type.icon class="kuu-new-topic-choice__icon"}}
              <span class="kuu-new-topic-choice__text">
                <span class="kuu-new-topic-choice__label">
                  {{i18n type.label}}
                </span>
                <span class="kuu-new-topic-choice__description">
                  {{i18n type.description}}
                </span>
              </span>
            </DButton>
          {{/each}}
        </div>
      </:body>
    </DModal>
  </template>
}
