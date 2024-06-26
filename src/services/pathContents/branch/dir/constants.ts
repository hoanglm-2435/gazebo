export const query = `
query BranchContents(
  $name: String!
  $repo: String!
  $branch: String!
  $path: String!
  $filters: PathContentsFilters!
) {
  owner(username: $name) {
    username
    repository(name: $repo) {
      __typename
      ... on Repository {
        repositoryConfig {
          indicationRange {
            upperRange
            lowerRange
          }
        }
        branch(name: $branch) {
          head {
            pathContents(path: $path, filters: $filters) {
              __typename
              ... on PathContents {
                results {
                  __typename
                  hits
                  misses
                  partials
                  lines
                  name
                  path
                  percentCovered
                  ... on PathContentFile {
                    isCriticalFile
                  }
                }
              }
              ... on UnknownPath {
                message
              }
              ... on MissingCoverage {
                message
              }
            }
          }
        }
      }
      ... on NotFoundError {
        message
      }
      ... on OwnerNotActivatedError {
        message
      }
    }
  }
}`
