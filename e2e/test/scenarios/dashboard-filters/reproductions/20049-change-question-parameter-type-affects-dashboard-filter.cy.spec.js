import { produce } from "immer";
import { restore, visitDashboard, visitQuestion } from "e2e/support/helpers";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import { SAMPLE_DB_ID } from "e2e/support/cypress_data";

const { PRODUCTS } = SAMPLE_DATABASE;

const filterDetails = {
  name: "Category",
  slug: "category",
  id: "c32a49e1",
  type: "string/contains",
  default: ["Doohickey"],
};

const questionDetails = {
  name: "Question",
  native: {
    query: "select * from products where {{category}} limit 10",
    "template-tags": {
      category: {
        id: "6b8b10ef-0104-1047-1e5v-2492d5954555",
        name: "category",
        "display-name": "Category",
        type: "dimension",
        dimension: ["field", PRODUCTS.CATEGORY, null],
        "widget-type": "string/contains",
      },
    },
  },
};

const dashboardDetails = {
  name: "Dashboard #20049",
  parameters: [filterDetails],
};
const dashcardDetails = {
  row: 0,
  col: 0,
  size_x: 16,
  size_y: 8,
};

describe.skip("issue 20049", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();

    cy.createNativeQuestionAndDashboard({
      questionDetails,
      dashboardDetails,
    }).then(({ body: { id, card_id, dashboard_id } }) => {
      cy.wrap(dashboard_id).as("dashboardId");
      cy.wrap(card_id).as("cardId");

      cy.request("PUT", `/api/dashboard/${dashboard_id}/cards`, {
        cards: [
          {
            id,
            card_id,
            ...dashcardDetails,
            parameter_mappings: [
              {
                card_id,
                parameter_id: filterDetails.id,
                target: ["dimension", ["template-tag", filterDetails.slug]],
              },
            ],
          },
        ],
      });
    });
  });

  it("Filter should stop applying if mapped question parameter is changed (metabase#20049)", () => {
    cy.get("@cardId").then(cardId => {
      updateQuestion(cardId);
      visitQuestion(cardId);
      verifyParameterType("String does not contain");
    });

    cy.get("@dashboardId").then(dashboardId => {
      // visit dashboard again
      visitDashboard(dashboardId);

      // make sure parameter is not applied
      cy.findAllByTestId("table-row").eq(0).should("not.contain", "Doohickey");
    });
  });
});

function updateQuestion(cardId) {
  const updatedNative = produce(questionDetails.native, draft => {
    draft["template-tags"][filterDetails.slug]["widget-type"] =
      "string/does-not-contain";
  });
  const updatedParameter = produce(
    questionDetails.native["template-tags"][filterDetails.slug],
    draft => {
      draft.target = ["dimension", ["template-tag", "category"]];
      draft.type = "string/does-not-contain";
    },
  );

  const newQuestionDetails = {
    dataset_query: {
      database: SAMPLE_DB_ID,
      native: updatedNative,
      type: "native",
    },
    parameters: [updatedParameter],
  };

  cy.request("PUT", `/api/card/${cardId}`, newQuestionDetails);
}

function verifyParameterType(type) {
  cy.findByTestId("query-builder-main").findByText("Open Editor").click();
  cy.icon("variable").click();

  cy.findByText("Filter widget type")
    .parent()
    .findByTestId("select-button")
    .contains(type);
}
