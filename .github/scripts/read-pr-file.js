// `pull_request_target` runs against the base repo, so the workspace checkout
// does not contain anything the PR added. Read the PR's files from the API at
// its head SHA instead — which also keeps a fork's code off the runner.
module.exports = (github, context) => {
  const ref = context.payload.pull_request.head.sha;

  return async (path) => {
    const { data } = await github.rest.repos.getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path,
      ref,
      mediaType: { format: "raw" },
    });

    // `raw` gives us a string, but fall back to the default JSON shape.
    return typeof data === "string"
      ? data
      : Buffer.from(data.content, "base64").toString("utf8");
  };
};
