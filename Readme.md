
## Sample Configuration

    {
      "serverURL": "http://my.graphql.server/graphql"
      "excelOutput": {
        "workbook": "stocks.xlsx",
        "worksheet": "Stocks",
        "debounce": 3000,
        "skipHeader": false,
        "columns": [
          {
            "key": "itemID",
            "name": "Ticker"
          },
          {
            "key": "fieldID",
            "name": "Field"
          },
          {
            "key": "value",
            "name": "Value"
          }
        ]
      },
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