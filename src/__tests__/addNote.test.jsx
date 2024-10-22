import { describe, expect, it, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routerConfig } from "../App";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import store from "../store";
import userEvent from "@testing-library/user-event";
import axios from "axios";

vi.mock("axios");

describe("노트 추가 및 편집 기능", () => {
  it("새로운 노트 추가, notes 라우팅, 사이드바에 링크 추가", async () => {
    const router = createMemoryRouter(routerConfig);

    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    );

    await userEvent.click(getByText("노트 추가"));

    const id = store.getState().notes[0].id;

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(`/notes/${id}`);
    });

    expect(getByText("새로운 노트")).toHaveAttribute("href", `/notes/${id}`);

    const titleEl = getByTestId("title");
    const contentEl = getByTestId("content");

    await userEvent.clear(titleEl);
    await userEvent.clear(contentEl);
    await userEvent.type(titleEl, "New Title");
    await userEvent.type(contentEl, "New Content");

    const updatedNote = store.getState().notes.find((n) => n.id === id);
    expect(updatedNote.title).toBe("New Title");
    expect(updatedNote.content).toBe("New Content");

    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: "요약된 내용",
            },
          },
        ],
      },
    };
    axios.post.mockResolvedValueOnce(mockResponse);

    await userEvent.click(getByText("요약"));
    const updatedNote1 = store.getState().notes.find((n) => n.id === id);
    expect(updatedNote1.summary).toBe("요약된 내용");
  });
});
