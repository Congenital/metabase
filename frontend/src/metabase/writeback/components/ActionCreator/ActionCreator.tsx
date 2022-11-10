import React, { useState, useMemo, useEffect } from "react";
import { t } from "ttag";
import _ from "underscore";
import { connect } from "react-redux";
import { push } from "react-router-redux";

import { useToggle } from "metabase/hooks/use-toggle";
import Actions from "metabase/entities/actions";
import Database from "metabase/entities/databases";
import { getMetadata } from "metabase/selectors/metadata";
import { createQuestionFromAction } from "metabase/writeback/selectors";

import type {
  WritebackQueryAction,
  ActionFormSettings,
} from "metabase-types/api";
import type { State } from "metabase-types/store";
import Modal from "metabase/components/Modal";
import { SavedCard } from "metabase-types/types/Card";
import Button from "metabase/core/components/Button";
import Question from "metabase-lib/Question";

import type NativeQuery from "metabase-lib/queries/NativeQuery";
import type Metadata from "metabase-lib/metadata/Metadata";

import { ActionCreatorHeader } from "./ActionCreatorHeader";
import { QueryActionEditor } from "./QueryActionEditor";
import { FormCreator } from "./FormCreator";
import {
  DataReferenceTriggerButton,
  DataReferenceInline,
} from "./InlineDataReference";

import {
  ActionCreatorBodyContainer,
  EditorContainer,
  ModalRoot,
  ModalActions,
  ModalLeft,
} from "./ActionCreator.styled";

import { newQuestion } from "./utils";

const mapStateToProps = (
  state: State,
  { action }: { action: WritebackQueryAction },
) => ({
  metadata: getMetadata(state),
  question: action ? createQuestionFromAction(state, action) : undefined,
  actionId: action ? action.id : undefined,
});

const mapDispatchToProps = {
  push,
};

interface ActionCreatorProps {
  metadata: Metadata;
  question?: Question;
  actionId?: number;
  modelId?: number;
  push: (url: string) => void;
  onClose?: () => void;
}

function ActionCreatorComponent({
  metadata,
  question: passedQuestion,
  actionId,
  modelId,
  onClose,
}: ActionCreatorProps) {
  const [question, setQuestion] = useState(
    passedQuestion ?? newQuestion(metadata),
  );
  const [formSettings, setFormSettings] = useState<
    ActionFormSettings | undefined
  >(undefined);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [isDataRefOpen, { toggle: toggleDataRef, turnOff: closeDataRef }] =
    useToggle(false);

  useEffect(() => {
    setQuestion(passedQuestion ?? newQuestion(metadata));

    // we do not want to update this any time the props or metadata change, only if action id changes
  }, [actionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const defaultModelId: number | undefined = useMemo(() => {
    if (modelId) {
      return modelId;
    }
    const params = new URLSearchParams(window.location.search);
    const modelQueryParam = params.get("model-id");
    return modelId ? Number(modelQueryParam) : undefined;
  }, [modelId]);

  if (!question || !metadata) {
    return null;
  }

  const query = question.query() as NativeQuery;

  const afterSave = (action: SavedCard) => {
    setQuestion(question.setCard(action));
    setTimeout(() => setShowSaveModal(false), 1000);
    onClose?.();
  };

  const handleClose = () => setShowSaveModal(false);

  const isNew = !actionId && !(question.card() as SavedCard).id;

  const handleExampleClick = () => {
    const sampleQuery =
      "UPDATE products\nSET rating = {{ my_new_value }}\nWHERE id = {{ my_primary_key }}";
    setQuestion(
      question.setQuery(query.setQueryText(query.queryText() + sampleQuery)),
    );
  };

  return (
    <>
      <Modal onClose={onClose} formModal={false} wide>
        <ModalRoot>
          <ActionCreatorBodyContainer>
            <ModalLeft>
              <DataReferenceTriggerButton onClick={toggleDataRef} />
              <ActionCreatorHeader
                type="query"
                name={question.displayName() ?? t`New Action`}
                onChangeName={newName =>
                  setQuestion(q => q.setDisplayName(newName))
                }
              />
              <EditorContainer>
                <QueryActionEditor
                  question={question}
                  setQuestion={setQuestion}
                />
              </EditorContainer>
              <ModalActions>
                <Button onClick={onClose} borderless>
                  {t`Cancel`}
                </Button>
                <Button primary onClick={() => setShowSaveModal(true)}>
                  {t`Save`}
                </Button>
              </ModalActions>
            </ModalLeft>

            <DataReferenceInline
              isOpen={isDataRefOpen}
              onClose={closeDataRef}
            />

            {!isDataRefOpen && (
              <FormCreator
                tags={query?.templateTagsWithoutSnippets()}
                formSettings={
                  question?.card()?.visualization_settings as ActionFormSettings
                }
                onChange={setFormSettings}
                onExampleClick={handleExampleClick}
              />
            )}
          </ActionCreatorBodyContainer>
        </ModalRoot>
      </Modal>
      {showSaveModal && (
        <Modal onClose={handleClose}>
          <Actions.ModalForm
            title={isNew ? t`New action` : t`Save action`}
            form={isNew ? Actions.forms.saveForm : Actions.forms.updateForm}
            action={{
              id: (question.card() as SavedCard).id,
              name: question?.displayName() ?? t`New Action`,
              description: question.description(),
              model_id: defaultModelId,
              formSettings,
              question,
            }}
            onSaved={afterSave}
            onClose={handleClose}
          />
        </Modal>
      )}
    </>
  );
}

export const ActionCreator = _.compose(
  Actions.load({
    id: (state: State, props: { actionId?: number }) => props.actionId,
  }),
  Database.loadList(),
  connect(mapStateToProps, mapDispatchToProps),
)(ActionCreatorComponent);
