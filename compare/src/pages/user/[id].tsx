import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { trpc } from "../../utils/trpc";
import ReactDiffViewer from "react-diff-viewer";
import Prism from "prismjs";
import "prism-themes/themes/prism-material-dark.css";

const UserPage: NextPage = ({userId}: any) => {
  const utils = trpc.useContext();
  const [lowerInterval, setLowerInterval] = useState(0);
  const [upperInterval, setUpperInterval] = useState(1);
  const [selectedFunction, setSelectedFunction] = useState(0)
  const [selectedFunctionName, setSelectedFunctionName] = useState("list_init")
  const [functionOptions, setFunctionOptions] = useState([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(undefined)

  const { data, isLoading } = trpc.useQuery([
    "documents.getDocuments",
    { id: userId },
  ], {enabled: userId !== null});

  const { data: suggestionData, isLoading: suggestionDataLoading } =
    trpc.useQuery(
      [
        "suggestions.getSuggestions",
        {
          id: userId,
          before: data?.timestamps[upperInterval] || "",
          after: data?.timestamps[lowerInterval] || "",
        },
      ],
      { enabled: !isLoading  && userId !== null}
    );

  const HighLightSyntax = (str: string) => {
    return (
      <pre
        style={{ display: "inline" }}
        dangerouslySetInnerHTML={{
          __html: Prism.highlight(str || "", Prism.languages.clike as any, "clike"),
        }}
      />
    );
  };

  useEffect(() => {
    utils.invalidateQueries(["suggestions.getSuggestions"]);
  }, [lowerInterval]);

  useEffect(() => {
    if (data){
      console.log(data.functions);
      setSelectedFunction(data.functions[1].name);
      data.functions[lowerInterval].forEach((func: any, index: number) => {
        if (func.name === selectedFunctionName) {
          setSelectedFunction(index);
        }
      })
    }

  }, [data, lowerInterval, upperInterval])

  useEffect(() => {
    if (data){


      const functionNames = data.functions[0].map((func: any) => func.name);
      console.log(functionNames);
      setFunctionOptions(functionNames);
    }

  }, [lowerInterval, upperInterval, data ])


  const getSelectedFunctionIndex = (name: string): any => {
    if (!data) return null;
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
                  key={func}
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
            {data.timestamps.map((_: any, index: number) => {
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
          <div className="flex flex-col items-center justify-start space-y-2 overflow-auto w-[1000px] space-y-4 pt-4 pl-4 pr-4">
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
                let range = suggestion.input.split("\n").length - data.functions[upperInterval][selectedFunction].startLine

                if (range < 0){
                  return <></>
                }
                return (
                  <div
                    onClick={() => setSelectedSuggestion(suggestion.suggestion.split("\n"))}
                    key={suggestion} className="text-white p-4 bg-lighter-background/70 rounded-sm cursor-pointer hover:bg-lighter-background/50 w-full text-sm">
                    <p>{HighLightSyntax(suggestion.suggestion)}</p>
                    <br/>
                    <ReactDiffViewer
                      newValue={data.functions[upperInterval][selectedFunction].content.split("\n").splice(range, suggestion.suggestion.split("\n").length).join("\n")}
                      oldValue={suggestion.suggestion}
                      splitView={false}
                      useDarkTheme={true}
                      renderContent={HighLightSyntax}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const lookup = {
    "94cc70d0-7086-4a40-894a-433c90f7d9c4": "bfd5a3a0-b870-11ec-8300-9599d633e048",
    "3533dacf-349b-4581-bc32-6b9f015199c1": "b6da6310-b6c9-11ec-8677-7d0f12447602",
    "f7a9f72a-9a8c-4a8a-9d6c-3866209746fe": "ee6f62e0-c4d8-11ec-9d92-7b65ae5e3ef6",
    "f7c30cdb-2a07-4fb4-bcad-d604cbe5266d": "b4aa11e0-bce5-11ec-a31a-efcb14fc8c35",
    "212591de-3007-4e4d-a0df-67d22d6c5f91": "240b7a60-b935-11ec-821a-53fb02f0180d",
    "96f8e461-e212-482d-b4ed-800ac9f57343": "1ab66170-b938-11ec-a46a-3d09bb2212ad",
    "5cbf4042-825b-49ae-8672-791070e5ae21": "c28d5800-b9cd-11ec-af50-55bad9f9ee95",
    "bbea417b-a3f1-451b-a25d-d9dfb2c8aed2": "18b88310-c5c4-11ec-b094-cba92fab9333",
    "b0ce9d89-f33e-4770-abfb-11e9830da4c4": "4a5d0a50-b79e-11ec-8d95-59adedb2d699",
    "7193a853-f8dd-423a-90be-39d0023d598e": "6431d070-be9a-11ec-a34d-5bf6832f697a",
    "f7128adc-38cf-403c-ab78-d760582a8ce1": "b92382f0-b50c-11ec-b886-757e20fdf72c",
    "fbf1986f-db73-4988-af05-0d3cb48dd0c9": "8d084fd0-ba8d-11ec-b5df-2794cccd031d",
    "74499f11-3870-4e4d-a6e4-ee76fbcf10eb": "3cbf6020-b50d-11ec-9a0d-07cfc4b8a551",
    "1f53c71a-e1b9-4b65-a11e-c15f3c38a6cf": "b77ffd50-b847-11ec-a4e8-b3ee2a22210b",
    "0ed7147a-475a-438b-8eee-c19d9d380739": "a4b518a0-b940-11ec-ba44-3994c91cbc98",
    "4992045a-4e79-4768-a0e8-8a8219c7b8d5": "0795b7f0-c04d-11ec-9133-d14dc4498358",
    "26a41023-c10e-41cc-b9e1-8103dc46f264": "4d90f8e0-b9d2-11ec-9eef-59e47889aff3",
    "a391803d-b2e8-47cd-8319-305aae3983bc": "b281ea60-c009-11ec-b6ca-0196040e1064",
    "74bd8618-cc17-42a6-8657-abebc4b6b500": "2feb9380-bb6d-11ec-8310-e7bca1dc6cc3",
    "275f0df3-1f22-43e1-b37c-147169908268": "2e9bfbf0-c9b9-11ec-9502-f59241ae9a5a",
    "0b73ad40-5cfb-453e-afb4-ba56c92167d0": "4ad61400-ba95-11ec-806c-471c56f4f285",
    "7f5fa288-f161-4057-b60b-6ebec0d16b80": "fdc41bf0-b9c0-11ec-b3a7-8d3910a4080c",
    "dac37585-9926-4e20-8ac1-40addd42f1a8": "1cebb590-b9c8-11ec-afe3-fb697e876d9e",
    "1f1c4c51-758b-4b08-88e3-e919cb5eaeaf": "9bee69a0-c981-11ec-a54d-c7e4ddc4acc9",
    "752045ea-d911-4015-a0e5-66f513cb8751": "5b4038d0-b9fe-11ec-8eaa-d3fc46a66515",
    "18ced82d-deec-4f66-9270-7770063fdf26": "910dc420-c712-11ec-8cbb-99d49a4622d8",
    "fd621e01-4962-4699-b49a-012c08563cb5": "c59abb00-babd-11ec-8e32-93f36e99a4d1",
    "6c026517-fcff-496b-a8d2-3b99e3714fa4": "531e0180-ba78-11ec-b82b-51b867346c4a",
    "6bc50178-eab7-4c0c-98ff-d5c129179996": "e9d9fc60-bbfd-11ec-83d8-5f9a70f84237",
    "b59feaf2-4c48-4ec0-8d00-3428362914a7": "9d530260-b9cd-11ec-8841-69c6ba46c9a3",
    "599ce961-34d5-427d-83bd-8ca692a7e766": "c80a73c0-bac3-11ec-a881-2b391506c7b6",
    "514e6c1d-f935-474d-899e-96e27d5babd3": "bbbbd040-bace-11ec-86ed-bfba75413d77",
    "9702f54c-200b-41f5-9fc4-971af3d86785": "8d913ac0-bb91-11ec-ac34-4d3d3687fed2",
    "dc47e379-a3ba-464c-aa89-69374080111a": "0f90fc60-ba9b-11ec-b510-73ec37eacadb",
    "a5ba06a2-cd4d-4aed-92ac-eeee80fe3e73": "662711d0-bdcb-11ec-8d9e-8348c9e16f37",
    "e5d2269a-cb40-4643-8134-13bc23ce41a7": "47299f30-bb84-11ec-8063-81e52407dd35",
    "3859e3df-d802-49a4-9039-4a6377d3d3ad": "6d68a490-bac9-11ec-b67c-915e61f32a99",
    "a2ab1ed3-1881-42af-b18d-1197d0ea95ae": "396ab770-bccf-11ec-b7ed-7980e2b64135",
    "e04ce3f6-46eb-465e-9828-5e768febf9be": "861c5010-c382-11ec-a8d8-a301df2b4675",
    "549eca81-c8f8-4237-9237-220ab72ac8cf": "8114b560-c0be-11ec-93a8-f3fa43f83153",
    "9efe4a5a-c72f-4cfa-b5d6-919a0f08d4bc": "75ab3de0-bf6d-11ec-bc21-a7fcd6ccc2a4",
    "ff36e2ef-af58-426f-97ae-dc8ba80ff4a0": "7bcf2340-c8ae-11ec-b942-0f1b1001f56a",
    "a3edd088-a9ab-4b80-ae98-01ffcfca615b": "cb778b40-beda-11ec-ad42-378ade0423ad",
    "833d22d1-766e-4e96-af92-180a3c4a2d99": "1821c590-bda6-11ec-b32a-d171e77e452d",
    "40a638f7-3fe3-43b0-b6cd-c47427778724": "dbfec540-c336-11ec-9018-9784731e5a57",
    "a4b3a969-44a1-4cea-87f5-86393eb85908": "a2b0d580-c4b7-11ec-b27a-f9d5dd797ebf",
    "f0e25db0-7a42-4c33-a22c-17b79e580330": "d6702c60-c348-11ec-97ec-1d7a477a0d6a",
    "32999001-1b8b-40d0-8776-0dc7fbd264ac": "f5c2e3c0-c346-11ec-bf00-2305f7b7a556",
    "5a790fe9-4950-4f24-903a-a7440f7f826f": "cdf6dd50-c905-11ec-8165-3526cdaf54e6",
    "632e58e4-4e9b-4311-a12a-13fbc92ad3a3": "dd724360-c981-11ec-9df9-73e5f5ea4333",
    "ddac8637-a99c-458d-bff5-916acb92e259": "69dd21e0-c7c4-11ec-9033-bdbaa13f5ce4",
    "035a8eed-29c0-4606-814d-4cb786d0b9de": "cc798380-c9b2-11ec-818c-61b977e76d8f",
    "caa12fcb-10a7-4f65-997b-0e1b1ba2c96d": "31f85610-c737-11ec-b9e6-31da557284eb",
    "856304e6-eec0-4e51-9ddd-95827f607190": "b161bf10-c9a6-11ec-b5da-6b05d1e50387",
    "c23b2615-700f-48f2-b33d-3433d1c25bb6": "5ec8d480-c80e-11ec-b46d-dd8428222e36",
    "f928b19b-6a98-4ed9-9c09-bfdf78073fd2": "bed35530-c98f-11ec-9ea9-2906929306b4",
    "a80d5d0f-724e-4a28-8af1-02ca84993567": "5426abd0-c906-11ec-995c-7d1a584df424",
    "9157b127-a7c4-4a29-971f-2b8cf24d2fee": "c28232b0-c7ea-11ec-9cd8-2f9d19e70af4",
    "954048a8-f0a5-4f87-9685-b81b46924619": "6236cf00-c9b7-11ec-8c15-df5d3d965ec5",
    "e71766a5-b1da-462f-8ea5-a7e12f82f58e": "9ec66e50-c80c-11ec-b36c-33cb280aa1b7",
    "ec83a892-5cfa-46bf-aab8-673aee747cb8": "62c1d240-c849-11ec-a087-f7794cf9656c",
    "36deba30-9345-480d-8221-387f5192f83d": "aaf8d210-c813-11ec-a0e8-a7bd336f656c",
    "c8a48b56-ce2e-4d25-8dd8-a23b5e6549b5": "d8758fe0-c907-11ec-b37c-67e980c31a6f",
    "a974cab3-f095-4360-969e-9942edfdedc1": "78f7bd30-c7e6-11ec-b7a8-c3180cbca0fd",
    "949d88c5-3896-4e45-a42e-8bff4c950949": "31bcae90-ca56-11ec-9db7-699867e536e4",
    "be6fa0a5-e7ff-4ae0-b846-57d9385acd84": "be4bd8d0-c7e6-11ec-8a3f-994c63adc17e",
    "21cb2508-2c4a-468d-a771-002ba7e0f211": "da715c50-c8b9-11ec-a050-4312fef36bb3",
    "74a8a6f6-fdda-4725-b99d-e6089cf74b51": "344cd9e0-c7e6-11ec-824b-5faa0226913f",
    "e603de64-bbb4-43fd-9506-ec25df81b660": "025bcf00-c984-11ec-ba2d-2fb3ecd8aa60",
    "925cb076-503f-4a8e-b8d9-0aac9efe5955": "0f32add0-c893-11ec-8c9f-3b264909f8b5",
    "394b3e22-bd6f-4c90-9300-5826a9d033ad": "1dd8bab0-c98c-11ec-90f7-85b948dda45f",
    "3cff10bf-23d9-48f4-9f45-96a223a8e2de": "5edcf130-ca5d-11ec-8d1d-c13e332ebb13",
    "244a5f10-2508-4376-afcd-c0706cae8b83": "69325230-ca51-11ec-aef3-6f236a08920b"
  } as any

  const userId = lookup[`${context.query.id}`]

  return {
    props: {
      userId: userId,
    },
  };
}

export default UserPage;

