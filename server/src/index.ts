import express, { Application, Request, Response } from "express";

const app: Application = express();
const port = 8000;

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(
	"/",
	async (req: Request, res: Response): Promise<Response> => {
		return res.status(200).send({
			message: "Hello World!",
		});
	}
);

app.post(
  "/log",
  async (req: Request, res: Response): Promise<Response> => {
    console.log(req.body)
    return res.status(201).send({
      message: "Successfully logged message"
    })
  }
)

try {
	app.listen(port, (): void => {
		console.log(`Connected successfully on port ${port}`);
	});
} catch (error) {
	console.error(`Error occured: ${error}`);
}
