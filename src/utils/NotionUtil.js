import composio from './composio.js';

export async function searchNotionPage(userId, connectedAccountId, query="", pageSize = 15) {
  try {
    const resp = await composio.tools.execute(
      "NOTION_SEARCH_NOTION_PAGE",
      {
        userId,
        connectedAccountId,
        arguments: {
          query,
          page_size: pageSize,
        },
      }
    );
    const responseData = resp.data?.response_data;
    if (resp.successful && responseData?.results) {
      const firstPage = responseData.results[0];
      return {
        successful: true,
        id: firstPage.id,
        title:
          firstPage.properties?.title ||
          firstPage.properties?.Name?.title?.[0]?.plain_text ||
          firstPage.object || // fallback
          "Untitled",
      };
    } else {
      console.error("❌ Notion search failed:", resp.error || "No results");
      return {
        successful: false,
        error: "Notion Search failed. No valid page access given"
      };
    }
  } catch (err) {

    console.error("⚡ Exception during Notion search:", err);
    return {
      successful: false,
      error: err.message
    };
  }
}

export async function createNotionDatabase(userId, connectedAccountId, parent_id) {
  try {
    const resp = await composio.tools.execute(
      "NOTION_CREATE_DATABASE",
      {
        userId: userId,
        connectedAccountId: connectedAccountId,
        arguments: {
          parent_id: parent_id, // page ID to contain the DB
          parent_type: "page",     // could be "page" or "workspace"
          title: "📩 Email Log Database",
          properties: [
            {name: "Name", type: "title" },
            {name: 'course/subject', type: "rich_text" },
            {name: "Due Date", type: "date" },
            {name: 'Email Link', type: "url" }
          ],
        },
      }
    );
    if (!resp.successful) return {
      successful: false,
      error: "Page not found. Please check the ID"
      }
    const url = resp.data.url;
    const url_parts = url.split('/');
    const db_id = url_parts[url_parts.length - 1];
    return {
      successful: true,
      url: url,
      db_id: db_id
    }
  }
  catch (err) {
    return {
      successful: false,
      error: err.message
    }
  }
}

