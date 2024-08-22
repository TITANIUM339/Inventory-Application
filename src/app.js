import "dotenv/config";
import express from "express";
import path from "node:path";
import indexRouter from "./routes/indexRouter.js";
import CustomError from "./helpers/customError.js";

const PORT = process.env.PORT || 80;
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname, "views"));

app.use(express.static(path.join("public")));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.locals.year = new Date().getFullYear();
    next();
});
app.use("/", indexRouter);
app.use((req, res, next) =>
    next(
        new CustomError(
            "Not Found",
            "It seems that the page you were looking for does not exist.",
            404,
        ),
    ),
);
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    res.status(err.statusCode).render("pages/error", { error: err });
});

app.listen(PORT, () => console.log(`Serving on: http://localhost:${PORT}`));
