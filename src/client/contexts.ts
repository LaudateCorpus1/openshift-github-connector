import React from "react";
import { GitHubUserInfo, OpenShiftUserInfo } from "../common/types/user-types";

export const OpenShiftUserContext = React.createContext<{
  user: OpenShiftUserInfo,
  reload:(() => Promise<void>),
    }>({} as any);

export const GitHubUserContext = React.createContext<{
  githubUser: GitHubUserInfo,
}>({} as any);

export const InConsoleContext = React.createContext<boolean>(false);

// export const AppContext = React.createContext<GitHubAppConfigNoSecrets | undefined>(undefined);