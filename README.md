# OpenShift Actions Connector

Coming soon...

## Installing on OpenShift
The one required input is the cluster domain. It is described in `values.yaml`.

Install from the root of the repo as follows:
```sh
helm upgrade --install actions-connector \
  containerize/chart/openshift-actions-connector \
  --set clusterAppsSubdomain=apps.sandbox-m2.ll9k.p1.openshiftapps.com
```


## Developing locally

You have to be logged into a cluster and have your current context's namespace set:

```sh
oc config set-context $(kubectl config current-context) --namespace="$namespace"
```

When running locally you have to create, configure, and link a service account to the app (in OpenShift this is done by the helm chart) as per [the wiki](https://github.com/redhat-actions/oc-login/wiki/Using-a-Service-Account-for-GitHub-Actions).

then

```sh
oc create sa github-actions
oc policy add-role-to-user edit -z github-actions -z
export CONNECTOR_SERVICEACCOUNT_NAME=github-actions
```

Then run `yarn dev` to run the development server.

There is no story for live reload on OpenShift yet.

To build and push the container images you can use the scripts in `package.json`, though I haven't added a way to override the registry user or path.

### Project Structure

The backend is in Express, and the frontend is in React using create-react-app (CRA). Code can be shared across the stack from the `common/` directory.

The structure is adapted from [this blog post](https://spin.atomicobject.com/2020/08/17/cra-express-share-code), and the boilerplate code is in [this repository](https://github.com/gvanderclay/cra-express).


### Debugging
There are debug configurations in launch.json which should work with VS Code.

If you want to use "Attach to Chrome" to debug the React you must launch chrom(e|ium) with `google-chrome --remote-debugging-port=9222`. This seems to cause VS Code to leak memory so you may have to restart Code every so often.

### Gotchas
CRA seems to have problems if you rename or delete a TypeScript file. It will keep trying to compile the old one. Restarting the development server fixes it.

Similarly, if you edit the ESLint config file, the change will not get picked up until a dev server restart.

If the CRA server is not restarting because a file is errored, you have to edit the file that it thinks is errored and save it, even if the fix for the error is in another file.

## Resources

### Frontend
https://react-bootstrap.github.io/components/alerts/
https://getbootstrap.com/docs/4.0/getting-started/introduction/

### Backend
https://docs.github.com/en/developers/apps/creating-a-github-app-from-a-manifest
https://docs.github.com/en/rest/reference
https://docs.github.com/en/rest/reference/permissions-required-for-github-apps
