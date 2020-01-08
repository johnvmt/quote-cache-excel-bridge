
## Sample Configuration

    {
      "serverURL": "http://my.graphql.server/graphql",
      "outputWorkbook": "stocks.xlsx",
      "outputWorksheet": "Apple",
      "outputDebounce": 3000,
      "subscriptions": [
        {
          "variable": "AAPL_OPEN",
          "collectionID": "MARKETS",
          "itemID": "AAPL",
          "fieldID": "OPEN"
        },
        {
          "variable": "AAPL_HIGH",
          "collectionID": "MARKETS",
          "itemID": "AAPL",
          "fieldID": "HIGH"
        },
        {
          "variable": "AAPL_LOW",
          "collectionID": "MARKETS",
          "itemID": "AAPL",
          "fieldID": "LOW"
        },
        {
          "variable": "AAPL_CLOSE",
          "collectionID": "MARKETS",
          "itemID": "AAPL",
          "fieldID": "CLOSE"
        },
      }
    }