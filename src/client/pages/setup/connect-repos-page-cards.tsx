import {
  Card, CardBody, CardTitle, Checkbox, Divider, Select, SelectOption, SelectVariant,
} from "@patternfly/react-core";
import { useState } from "react";
import ApiEndpoints from "../../../common/api-endpoints";
import ApiResponses from "../../../common/api-responses";
import { toValidK8sName } from "../../../common/common-util";
import DataFetcher from "../../components/data-fetcher";
import { DataFetcherCard } from "../../components/data-fetcher-card";
import { ExternalLink } from "../../components/external-link";
import NamespaceSelect from "../../components/namespace-select";
import { CommonIcons } from "../../util/icons";

export function ConnectReposIntroCard(): JSX.Element {
  return (
    <>
      <Card>
        <CardTitle>
            Connect GitHub Repositories
        </CardTitle>
        <CardBody>
          <p>
          This step connects GitHub repositories to your OpenShift cluster by
          creating <ExternalLink href="https://docs.github.com/en/actions/reference/encrypted-secrets">
            encrypted secrets
            </ExternalLink> in
          your repositories which you can then reference in your workflows to log in to this cluster.
          </p>
          <p>
            A Service Account Token will be created for each repository that you connect.
            This way, you can revoke a single {`repository's`} access by deleting its token without affecting other repositories.
          </p>
          <p>
            Service account tokens do not expire
          </p>
          <p>
            <ExternalLink
              href={"https://github.com/redhat-actions/oc-login#readme"}
            >
              <CommonIcons.Documentation className="me-2" />
            Read More about using oc-login to log in to OpenShift from GitHub Actions.
            </ExternalLink>
          </p>

          {/* <p>
              It is recommended to create a new Service Account Token for each repository that you will connect.
              See <ExternalLink
                href={"https://github.com/redhat-actions/oc-login/wiki/Using-a-Service-Account-for-GitHub-Actions"}
              >
                Using a Service Account for GitHub Actions
              </ExternalLink> for more information about authenticating with a Service Account.
            </p>
            <p>

            </p>
            <div className="center-y">
              <input type="checkbox"
                // className="form-check-input"
                id={this.createSATokensId}
                checked={createSATokens}
                onChange={(e) => this.setState({ createSATokens: e.currentTarget.checked })}
              />
              <label htmlFor={this.createSATokensId} className="b clickable">Create Service Account Tokens</label>
            </div> */}
        </CardBody>
      </Card>
    </>
  );
}

export function DefaultSecretsCard(
  { namespace, createNamespaceSecret, serviceAccount }:
  { namespace?: string, createNamespaceSecret: boolean, serviceAccount?: string }
) {
  return (
    <Card>
      <CardTitle>
        Secrets
      </CardTitle>
      <CardBody>
        <DataFetcher key={"" + namespace + serviceAccount}
          type="api"
          endpoint={ApiEndpoints.App.Repos.RepoSecretDefaults}
          loadingDisplay="card-body"
        >
          {
            (res: ApiResponses.DefaultSecretsResponse) => {

              const count = createNamespaceSecret ? "three" : "two";

              return (
                <div>
                  <p>
                  To each repository, {count} secrets will be added:
                  </p>
                  <ol>
                    <li>
                      <code>{res.defaultSecrets.clusterServerUrl}</code> will
                    contain the URL to this OpenShift {"cluster's"} API server
                      <DataFetcher type="api" endpoint={ApiEndpoints.Cluster.Root} loadingDisplay="none">{
                        (clusterData: ApiResponses.ClusterState) => {
                          if (!clusterData.connected) {
                            return ".";
                          }

                          return (
                            <>
                            : <ExternalLink href={clusterData.clusterInfo.externalServer}>
                                {clusterData.clusterInfo.externalServer}
                              </ExternalLink>
                            </>
                          );
                        }
                      }
                      </DataFetcher>
                    </li>
                    <li>
                      <code>{res.defaultSecrets.clusterToken}</code> will
                      contain a Service Account Token for the service account,&nbsp;
                      {
                        namespace && serviceAccount ? <b>{namespace}/{serviceAccount} </b> : ""
                      }
                      which can be used to log into the OpenShift API server.
                      A different service account token is generated for each repository, but they all log in as the same service account.
                    </li>
                    {
                      createNamespaceSecret ?
                        <li>
                          <code>{res.defaultSecrets.namespace}</code> will contain the configured namespace{
                            namespace ? <>, <b>{namespace}</b></> : ""
                          }.
                        </li>
                        : ""
                    }
                  </ol>
                </div>
              );
            }}
        </DataFetcher>
      </CardBody>
    </Card>
  );
}

export function NamespaceSACards(
  {
    namespace, setNamespace, serviceAccount, setServiceAccount,
    createNamespaceSecret, setCreateNamespaceSecret,
  }: {
    namespace: string | undefined,
    setNamespace: (namespace: string | undefined) => void,
    serviceAccount: string | undefined,
    setServiceAccount: (serviceAccount: string | undefined, role: string | undefined) => void,
    createNamespaceSecret: boolean,
    setCreateNamespaceSecret: (createNamespaceSecret: boolean) => void,
  }
): JSX.Element {

  return (
    <DataFetcherCard type="api" title="Service Account for Workflow Authentication" endpoint={ApiEndpoints.Cluster.Namespaces.Root}>{
      (namespacesRes: ApiResponses.UserNamespaces) => {

        return (
          <>
            <p>
              Select the namespace you want these repositories&apos; workflows to use for authentication.
              <br/>
              Workflows will execute in this namespace, and will not be able to access other namespaces.
            </p>

            <NamespaceSelect namespacesRes={namespacesRes} namespace={namespace} setNamespace={setNamespace} />

            <Checkbox
              id="create-ns-secret-cb"
              className="my-3"
              label={"Create an Actions secret containing this namespace"}
              isChecked={createNamespaceSecret}
              onChange={(checked) => { setCreateNamespaceSecret(checked); }}
            />

            <Divider className="my-4"/>

            <ServiceAccountSection namespace={namespace} serviceAccount={serviceAccount} setServiceAccount={setServiceAccount} />

            <ExternalLink
              href={"https://github.com/redhat-actions/oc-login/wiki/Using-a-Service-Account-for-GitHub-Actions"}
            >
              <CommonIcons.Documentation className="me-2" />
              Read More about authenticating using a service account for GitHub Actions.
            </ExternalLink>
          </>
        );
      }
    }
    </DataFetcherCard>
  );
}

const DEFAULT_SA_ROLE = "edit";

export function ServiceAccountSection(
  { namespace, serviceAccount, setServiceAccount }: {
    namespace: string | undefined, serviceAccount: string | undefined,
    setServiceAccount: (serviceAccount: string | undefined, role: string | undefined) => void,
  }
): JSX.Element {

  const [ isOpen, setIsOpen ] = useState(false);

  if (!namespace) {
    return (
      <></>
    );
  }

  return (
    <DataFetcher
      key={namespace} loadingDisplay="card-body" type="api"
      endpoint={ApiEndpoints.Cluster.Namespaces.ServiceAccounts.withParam(namespace)}
    >{
        ({ serviceAccounts }: ApiResponses.UserNamespacedServiceAccounts) => {
          if (serviceAccounts.length === 0) {
            return (
              <p className="error">
              There are no service account in {namespace}
              </p>
            );
          }

          const selectPlaceholder = "Select a Service Account, or start typing to filter";

          return (
            <>
              <p>
                Select the Service Account in <b>{namespace}</b> you want these repositories to have access to.
                <br/>
                The service account must be granted the permissions it needs to execute workflows.
                <br/>
                You may enter the name of a new Service Account. It will be bound to the <b>{DEFAULT_SA_ROLE}</b> ClusterRole in its namespace.
              </p>
              <Select
                variant={SelectVariant.typeahead}
                typeAheadAriaLabel={selectPlaceholder}
                isCreatable={true}
                onToggle={(isExpanded) => setIsOpen(isExpanded)}
                onClear={() => setServiceAccount(undefined, undefined)}
                isOpen={isOpen}
                placeholderText={selectPlaceholder}
                selections={serviceAccount}
                onSelect={(_event, selection, isPlaceholder) => {
                  setIsOpen(false);
                  if (isPlaceholder || selection === "") {
                    setServiceAccount(undefined, undefined);
                    return;
                  }
                  setServiceAccount(toValidK8sName(selection.toString().trim()), DEFAULT_SA_ROLE);
                }}
              >
                {
                  serviceAccounts.map((sa, i) => (
                    <SelectOption key={i} value={sa} />
                  ))
                }
              </Select>

              {
                serviceAccount && !serviceAccounts.includes(serviceAccount) ?
                  <p>
                    <CommonIcons.Info className="me-2"/>
                    <b>{serviceAccount}</b> will be created in the <b>{namespace}</b> namespace.
                  </p>
                  : ""
              }
              {
                namespace && serviceAccount ?
                  <p>
                  The Service Account tokens created, and copied into the Actions secrets, will belong to this service account.
                  </p>
                  : ""
              }

              <Divider className="my-3"/>

            </>
          );
        }
      }
    </DataFetcher>
  );
}
