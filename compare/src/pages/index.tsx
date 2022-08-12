import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import ReactDiffViewer from "react-diff-viewer";
import Prism from "prismjs";
import "prism-themes/themes/prism-material-dark.css";

const Home: NextPage = () => {
  const utils = trpc.useContext();
  const [lowerInterval, setLowerInterval] = useState(0);
  const [upperInterval, setUpperInterval] = useState(1);
  const [selectedFunction, setSelectedFunction] = useState(0)
  const [selectedFunctionName, setSelectedFunctionName] = useState("list_init")
  const [functionOptions, setFunctionOptions] = useState([])

  const { data, isLoading } = trpc.useQuery([
    "documents.getDocuments",
    { id: "a4b518a0-b940-11ec-ba44-3994c91cbc98" },
  ]);

  const { data: suggestionData, isLoading: suggestionDataLoading } =
    trpc.useQuery(
      [
        "suggestions.getSuggestions",
        {
          id: "a4b518a0-b940-11ec-ba44-3994c91cbc98",
          before: data?.timestamps[upperInterval] || "",
          after: data?.timestamps[lowerInterval] || "",
        },
      ],
      { enabled: !isLoading }
    );

  const HighLightSyntax = (str: string) => {
    return (
      <pre
        style={{ display: "inline" }}
        dangerouslySetInnerHTML={{
          __html: Prism.highlight(str || "", Prism.languages.clike, "clike"),
        }}
      />
    );
  };

  useEffect(() => {
    utils.invalidateQueries(["suggestions.getSuggestions"]);
  }, [lowerInterval, selectedFunction]);

  useEffect(() => {
    if (data){
      console.log(data.functions);
      setSelectedFunction(data.functions[1].name);
      data.functions[lowerInterval].forEach((func, index) => {
        if (func.name === selectedFunctionName) {
          setSelectedFunction(index);
        }
      })
    }

  }, [data, lowerInterval, upperInterval])

  useEffect(() => {
    if (data){
      console.log(data.functions)
      let maxLength = 0;
      let maxIndex = 0;
      for (let i = 0; i < data.functions.length; i++) {
        if (data.functions[i].length > maxLength) {
          maxIndex = i;
        }
      }

      let functionNames = data.functions[maxIndex];
      functionNames = functionNames.map(func => func.name);
      console.log(functionNames);
      setFunctionOptions(functionNames);
    }

  }, [lowerInterval, upperInterval, data ])


  const getSelectedFunctionIndex = (name: string): any => {
    for (let i = 0; i < data.functions[lowerInterval].length; i++) {
      if (data.functions[lowerInterval][i].name === name) {
        console.log(i)
        return i;
      }
    }
  }

  return (
    <div className="w-screen min-h-screen flex flex-col max-w-screen  max-h-screen bg-dark-background items-center">
      {!isLoading && data && (
        <div className="w-full h-full flex  max-h-screen">
          <div className="flex flex-col items-center justify-start space-y-2 overflow-auto w-[450px] p-4 space-y-4">
            <h1 className="font-bold text-white">Functions</h1>
            {functionOptions.map((func, index) => {
              if (func === selectedFunctionName) {
                return (
                  <div
                    className="text-white p-4 bg-lighter-background rounded-sm border border-1 border-purple-400 w-full"
                  >
                    <p>{func}</p>
                  </div>
                )
              }


              return (
                <div
                  className="w-full text-white p-4 bg-lighter-background/70 rounded-sm cursor-pointer hover:bg-lighter-background/50"
                  onClick={() => {
                    setSelectedFunction(getSelectedFunctionIndex(func))
                    setSelectedFunctionName(func)
                  }}
                >
                  <p>{func}</p>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col items-center justify-start space-y-2 overflow-auto w-[350px] p-4 space-y-4">
            <h1 className="font-bold text-white">Intervals</h1>
            {data.timestamps.map((_, index) => {
              let leftTimestamp = new Date(
                data.timestamps[index]
              ).toLocaleTimeString();
              let rightTimestamp = new Date(
                data.timestamps[index + 1]
              ).toLocaleTimeString();

              if (index === lowerInterval) {
                return (
                  <div
                    onClick={() => {
                      setLowerInterval(index);
                      setUpperInterval(index + 1);
                    }}
                    className="text-white p-4 bg-lighter-background rounded-sm border border-1 border-purple-400"
                  >
                    <p>{`${leftTimestamp} - ${rightTimestamp}`}</p>
                  </div>
                );
              }


              if (index >= data.functions.length -1 || selectedFunction >= data.functions[index].length -1 || selectedFunction >= data.functions[index + 1].length -1) {
                return (<></>)
              }
              if (data.functions[index][selectedFunction].content !== data.functions[index + 1][selectedFunction].content) {
                return (
                  <div
                    onClick={() => {
                      setLowerInterval(index);
                      setUpperInterval(index + 1);
                    }}
                    className="text-white p-4 bg-lighter-background/70 rounded-sm cursor-pointer hover:bg-lighter-background/50"
                  >
                    <p>{`${leftTimestamp} - ${rightTimestamp}`}</p>
                  </div>
                )

              }
              return (
                <></>

              );
            })}
          </div>



          <div className="w-full overflow-auto language-css">
            {data.functions[lowerInterval][selectedFunction].content && data.functions[upperInterval][selectedFunction].content && (
              <ReactDiffViewer
                leftTitle={data.functions[lowerInterval][selectedFunction].name}
                rightTitle={data.functions[upperInterval][selectedFunction].name}
                oldValue={data.functions[lowerInterval][selectedFunction].content}
                newValue={data.functions[upperInterval][selectedFunction].content}
                renderContent={HighLightSyntax}
                useDarkTheme={true}
                showDiffOnly={false}
                splitView={true}
              />
              )}
          </div>
          <div className="flex flex-col items-center justify-start space-y-2 overflow-auto w-[500px] space-y-4 pt-4 pl-4 pr-4">
            <h1 className="font-bold text-white">Suggestions</h1>
            {suggestionDataLoading && (
              <p className="text-lg text-white">Loading...</p>
            )}
            {!suggestionDataLoading &&
              suggestionData &&
              suggestionData.suggestions.length === 0 && (
                <p className="text-lg text-white">No Suggestions Given</p>
              )}
            {!suggestionDataLoading &&
              suggestionData &&
              suggestionData.suggestions.map((suggestion: any) => {
                return (
                  <div className="text-white p-4 bg-lighter-background/70 rounded-sm cursor-pointer hover:bg-lighter-background/50 w-full text-sm">
                    <p>{HighLightSyntax(suggestion.suggestion)}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
