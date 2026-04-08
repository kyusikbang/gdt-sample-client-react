import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../lib/api";
import type { Todo } from "../lib/todos";

type TodosQueryData = Todo[];

type MutationContext = {
  previousTodos: TodosQueryData;
};

const todosQueryKey = ["todos"] as const;

export function useTodos() {
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: todosQueryKey,
    queryFn: () => request<Todo[]>("/api/todos/"),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const createTodoMutation = useMutation<Todo, Error, string, MutationContext>({
    mutationFn: (nextTitle: string) =>
      request<Todo>("/api/todos/", {
        method: "POST",
        body: JSON.stringify({ title: nextTitle }),
      }),
    onMutate: async (nextTitle) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey });

      const previousTodos = queryClient.getQueryData<TodosQueryData>(todosQueryKey) ?? [];
      const optimisticTodo: Todo = {
        id: `optimistic-${crypto.randomUUID()}`,
        title: nextTitle,
        isCompleted: false,
      };

      queryClient.setQueryData<TodosQueryData>(todosQueryKey, [
        optimisticTodo,
        ...previousTodos,
      ]);

      return { previousTodos };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(todosQueryKey, context.previousTodos);
      }
    },
    onSuccess: (createdTodo, nextTitle) => {
      queryClient.setQueryData<TodosQueryData>(todosQueryKey, (currentTodos = []) => {
        const optimisticId = currentTodos.find(
          (todo) =>
            todo.id.startsWith("optimistic-") &&
            todo.title === nextTitle &&
            !todo.isCompleted,
        )?.id;

        return currentTodos.map((todo) =>
          todo.id === optimisticId ? createdTodo : todo,
        );
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: todosQueryKey });
    },
  });

  const updateTodoMutation = useMutation<Todo, Error, Todo, MutationContext>({
    mutationFn: (todo: Todo) =>
      request<Todo>(`/api/todos/${todo.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: todo.title,
          isCompleted: !todo.isCompleted,
        }),
      }),
    onMutate: async (todo) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey });

      const previousTodos = queryClient.getQueryData<TodosQueryData>(todosQueryKey) ?? [];

      queryClient.setQueryData<TodosQueryData>(
        todosQueryKey,
        previousTodos.map((currentTodo) =>
          currentTodo.id === todo.id
            ? { ...currentTodo, isCompleted: !currentTodo.isCompleted }
            : currentTodo,
        ),
      );

      return { previousTodos };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(todosQueryKey, context.previousTodos);
      }
    },
    onSuccess: (updatedTodo) => {
      queryClient.setQueryData<TodosQueryData>(todosQueryKey, (currentTodos = []) =>
        currentTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)),
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: todosQueryKey });
    },
  });

  const deleteTodoMutation = useMutation<void, Error, string, MutationContext>({
    mutationFn: (id: string) =>
      request<void>(`/api/todos/${id}`, {
        method: "DELETE",
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey });

      const previousTodos = queryClient.getQueryData<TodosQueryData>(todosQueryKey) ?? [];

      queryClient.setQueryData<TodosQueryData>(
        todosQueryKey,
        previousTodos.filter((todo) => todo.id !== id),
      );

      return { previousTodos };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(todosQueryKey, context.previousTodos);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: todosQueryKey });
    },
  });

  const remainingCount = useMemo(
    () => todosQuery.data?.filter((todo) => !todo.isCompleted).length ?? 0,
    [todosQuery.data],
  );

  const completedCount = (todosQuery.data?.length ?? 0) - remainingCount;
  const isBusy =
    createTodoMutation.isPending ||
    updateTodoMutation.isPending ||
    deleteTodoMutation.isPending;

  return {
    todosQuery,
    createTodoMutation,
    updateTodoMutation,
    deleteTodoMutation,
    remainingCount,
    completedCount,
    isBusy,
  };
}
