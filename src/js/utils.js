const imagesLoaded = require("imagesloaded");

/**
 * Preload images
 * @param {String} selector - Selector/scope from where images need to be preloaded. Default is 'img'
 */
const preloadImages = (selector = "img") => {
  return new Promise((resolve) => {
    imagesLoaded(
      document.querySelectorAll(selector),
      { background: true },
      resolve
    );
  });
};

/**
 * Preload fonts
 * @param {String} id
 */
const preloadFonts = () => {
  return new Promise((resolve) => {
    WebFont.load({
      google: {
        families: ["Bungee Inline", "Quicksand"],
      },
      active: resolve,
    });
  });
};

let contentfulData = null;
const fetchData = async () => {
  const contentfulSpaceID = process.env.REACT_APP_CONTENTFUL_SPACE_ID;
  const contentfulAccessToken = process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;

  const query = `{
        pageCollection (limit: 10) {
          items {
            title
            sys {
              id
            }
            itemsCollection {
              items {
                __typename
                sys {
                  id
                  
                }
              }
            }
            rotationSpeed
            position
            scale
            cameraPosition
            cameraLookAt
            cameraFov
          }
        }
      }
      
      `;

  const photoQuery = (id, index) => {

    
    return `{ 
        photo(id: "${id}") {
          sys {
            id
          }
          poster {
            title
            description
            contentType
            fileName
            size
            url
            width
            height
          }
          title
          description {
            json
          }
        }
    }
    `;
  };

  const jobQuery = (id, index) => {
    return `{ 
        job(id:"${id}") {
          sys {
            id
          }
          company
          jobTitle
          poster {
            title
            description
            contentType
            fileName
            size
            url
            width
            height
          }
          startDate
          endDate
          description {
            json
          }
        }
    }
    `;
  };

  const projectQuery = (id, index) => {
    return `{ 
        project(id: "${id}") {
          sys {
            id
          }
          title
          poster {
            title
            description
            contentType
            fileName
            size
            url
            width
            height
          }
          video {
            title
            description
            contentType
            fileName
            size
            url
            width
            height
          }
          description {
            json
            links {
              assets {
                block {
                  url
                  sys {
                    id
                  }
                  title
                  description
                }
              }
            }
          }
        }
    }
    `;
  };

  const skillQuery = (id, index) => {
    return `{ 
        
       skill(id: "${id}") {
        description {
          json
        }
        sys {
          id
        }
          name
          poster {
            title
            description
            contentType
            fileName
            size
            url
            width
            height
          }
        }
    }
    `;
  };
  const experimentQuery = (id, index) => {
    return `{ 
        
       experiment(id: "${id}") {
        description {
          json
        }
        title
        sys {
          id
        }

          poster {
            title
            description
            contentType
            fileName
            size
            url
            width
            height
          }
        }
    }
    `;
  };
  const aboutQuery = (id, index) => {
    return `{ 
        
       about(id: "${id}") {
        sys {
          id
        }
        title
        description {
          json
        }
        poster {
          title
          description
          contentType
          fileName
          size
          url
          width
          height
        }
        }
    }
    `;
  };


  

  var mapArray = [];
  const data = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${contentfulSpaceID}/environments/master?access_token=${contentfulAccessToken}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authenticate the request
        // Authorization: "Bearer ${TOKEN}",
      },
      // send the GraphQL query
      body: JSON.stringify({ query }),
    }
  )
    .then((response) => response.json())
    .then(({ data, errors }) => {
      if (errors) {
        console.error(errors);
      }
      mapArray = data.pageCollection.items;
    });
  let promisesDone = 0;
  Promise.all(
    mapArray.map((section) => {
      const items = section.itemsCollection.items;
      const subCollection = [];

      const promises = items.map(async (item, index) => {
        const query =
          item.__typename === "Photo"
            ? photoQuery(item.sys.id, index)
            : item.__typename === "Skill"
            ? skillQuery(item.sys.id, index)
            : item.__typename === "Job"
            ? jobQuery(item.sys.id, index)            
            : item.__typename === "About"
            ? aboutQuery(item.sys.id, index)
            : item.__typename === "Experiment"
            ? experimentQuery(item.sys.id, index)
            : projectQuery(item.sys.id, index);
        await fetch(
          `https://graphql.contentful.com/content/v1/spaces/${contentfulSpaceID}/environments/master?access_token=${contentfulAccessToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          }
        )
          .then((response) => response.json())
          .then(({ data, errors }) => {
            if (errors) {
              console.error(errors);
            }

            subCollection.push(data);
          });

        return subCollection;
      });

      Promise.all(promises).then((data) => {
        promisesDone++;

        if (promisesDone === mapArray.length) {
          console.log("maprarray",mapArray)
          contentfulData = mapArray;
        }
        section.itemsCollection = subCollection;
      });
    })
  );
};

export { preloadImages, preloadFonts, fetchData, contentfulData };
