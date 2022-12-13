import React from "react";

import type { CollectionId, User } from "metabase-types/api";

import CollectionBreadcrumbs from "../../containers/CollectionBreadcrumbs";
import QuestionLineage from "../../containers/QuestionLineage";

import NewItemButton from "../NewItemButton";
import ProfileLink from "../ProfileLink";
import SearchBar from "../SearchBar";

import DataAppBackButton from "./DataAppBackButton";
import AppBarLogo from "./AppBarLogo";

import {
  AppBarLeftContainer,
  AppBarRightContainer,
  AppBarRoot,
  AppBarInfoContainer,
  AppBarProfileLinkContainer,
} from "./AppBarLarge.styled";

export interface AppBarLargeProps {
  currentUser: User;
  collectionId?: CollectionId;
  isNavBarOpen?: boolean;
  isNavBarEnabled?: boolean;
  isSearchVisible?: boolean;
  isNewButtonVisible?: boolean;
  isProfileLinkVisible?: boolean;
  isEditingDataAppQuestion?: boolean;
  isCollectionPathVisible?: boolean;
  isQuestionLineageVisible?: boolean;
  onToggleNavbar: () => void;
  onLogout: () => void;
}

const AppBarLarge = ({
  currentUser,
  collectionId,
  isNavBarOpen,
  isNavBarEnabled,
  isSearchVisible,
  isNewButtonVisible,
  isProfileLinkVisible,
  isEditingDataAppQuestion,
  isCollectionPathVisible,
  isQuestionLineageVisible,
  onToggleNavbar,
  onLogout,
}: AppBarLargeProps): JSX.Element => {
  const isNavBarVisible = isNavBarOpen && isNavBarEnabled;

  return (
    <AppBarRoot isNavBarOpen={isNavBarVisible}>
      <AppBarLeftContainer isNavBarEnabled={isNavBarEnabled}>
        <AppBarLogo
          isNavBarOpen={isNavBarVisible}
          isNavBarEnabled={isNavBarEnabled}
          onToggleClick={onToggleNavbar}
        />
        <AppBarInfoContainer
          isVisible={
            !isNavBarVisible ||
            isQuestionLineageVisible ||
            isEditingDataAppQuestion
          }
        >
          {isEditingDataAppQuestion ? (
            <DataAppBackButton />
          ) : isQuestionLineageVisible ? (
            <QuestionLineage />
          ) : isCollectionPathVisible ? (
            <CollectionBreadcrumbs />
          ) : null}
        </AppBarInfoContainer>
      </AppBarLeftContainer>
      {(isSearchVisible || isNewButtonVisible || isProfileLinkVisible) && (
        <AppBarRightContainer>
          {isSearchVisible && <SearchBar />}
          {isNewButtonVisible && <NewItemButton collectionId={collectionId} />}
          {isProfileLinkVisible && (
            <AppBarProfileLinkContainer>
              <ProfileLink user={currentUser} onLogout={onLogout} />
            </AppBarProfileLinkContainer>
          )}
        </AppBarRightContainer>
      )}
    </AppBarRoot>
  );
};

export default AppBarLarge;
