/**
 * ============================================================================
 * 示例 02: React Query Mutations（数据变更）
 * ============================================================================
 *
 * 本文件涵盖以下内容：
 * 1. useMutation 基础用法
 * 2. mutation 回调：onSuccess / onError / onSettled
 * 3. 乐观更新（Optimistic Update）的实现
 * 4. mutation 状态重置（reset）
 * 5. useMutationState 获取所有 mutation 状态（v5 新特性）
 * 6. mutate vs mutateAsync 的区别
 *
 * 学习建议：学完 01-basics.tsx 后再来学习本文件。
 *           Mutation 是修改服务端数据的核心 API。
 * ============================================================================
 */

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useState } from "react";

// ============================================================================
// 第一部分：模拟 API
// ============================================================================

/** 待办事项类型 */
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

/** 模拟数据库（内存中的数据存储） */
let mockDatabase: Todo[] = [
  { id: 1, title: "学习 React Query 基础", completed: true },
  { id: 2, title: "学习 useMutation", completed: false },
  { id: 3, title: "学习乐观更新", completed: false },
  { id: 4, title: "学习缓存管理", completed: false },
];
let nextId = 5;

/**
 * 模拟创建待办事项
 * @param title - 待办事项标题
 * @returns 新创建的待办事项
 */
async function createTodo(title: string): Promise<Todo> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newTodo: Todo = {
    id: nextId++,
    title,
    completed: false,
  };
  mockDatabase.push(newTodo);
  return newTodo;
}

/**
 * 模拟删除待办事项
 * @param id - 待办事项 ID
 * @returns 被删除的待办事项
 */
async function deleteTodo(id: number): Promise<Todo> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const index = mockDatabase.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("待办事项不存在");

  const [deleted] = mockDatabase.splice(index, 1);
  return deleted;
}

/**
 * 模拟更新待办事项标题
 * @param param - 包含 id 和新标题
 * @returns 更新后的待办事项
 */
async function updateTodoTitle({
  id,
  title,
}: {
  id: number;
  title: string;
}): Promise<Todo> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const todo = mockDatabase.find((t) => t.id === id);
  if (!todo) throw new Error("待办事项不存在");

  // 模拟 20% 的失败率，用于演示错误处理
  if (Math.random() < 0.2) {
    throw new Error("网络错误：更新失败");
  }

  todo.title = title;
  return { ...todo };
}

/**
 * 模拟切换待办事项完成状态
 * @param id - 待办事项 ID
 * @returns 更新后的待办事项
 */
async function toggleTodo(id: number): Promise<Todo> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const todo = mockDatabase.find((t) => t.id === id);
  if (!todo) throw new Error("待办事项不存在");

  todo.completed = !todo.completed;
  return { ...todo };
}

/**
 * 模拟获取待办事项列表
 * @returns 所有待办事项
 */
async function fetchTodos(): Promise<Todo[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockDatabase];
}

// ============================================================================
// 第二部分：QueryClient 配置
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
    },
  },
});

// ============================================================================
// 第三部分：useMutation 基础用法
// ============================================================================

/**
 * 示例 1：最简单的 useMutation
 *
 * 【教学提示】
 * useQuery vs useMutation 的区别：
 * - useQuery：用于 GET 请求（读取数据），自动执行
 * - useMutation：用于 POST/PUT/DELETE 请求（修改数据），手动触发
 *
 * useMutation 不会自动执行！你需要调用 mutate() 或 mutateAsync() 来触发。
 *
 * useMutation 配置：
 * - mutationFn: 必需，执行变更的异步函数
 * - onSuccess: 变更成功后的回调
 * - onError: 变更失败后的回调
 * - onSettled: 无论成功或失败都会执行的回调
 * - onMutate: 变更开始前的回调（适合做乐观更新）
 */
function BasicMutationExample() {
  const [newTitle, setNewTitle] = useState("");

  /**
   * 创建 useMutation
   *
   * mutationFn 接收的参数就是 mutate() 传入的参数
   * 例如：addMutation.mutate("新待办") → mutationFn 接收到 "新待办"
   */
  const addMutation = useMutation({
    mutationFn: createTodo,
    /**
     * onSuccess 回调
     * 在 mutationFn 成功执行后调用
     * 参数：
     * - data: mutationFn 返回的数据
     * - variables: 传入 mutate() 的参数
     */
    onSuccess(data, variables) {
      console.log("创建成功:", data, "参数:", variables);
    },
    /**
     * onError 回调
     * 在 mutationFn 抛出异常后调用
     * 参数：
     * - error: 错误对象
     * - variables: 传入 mutate() 的参数
     */
    onError(error, variables) {
      console.error("创建失败:", error, "参数:", variables);
    },
    /**
     * onSettled 回调
     * 无论成功或失败都会执行
     * 适合做"清理工作"，如隐藏 loading 状态
     */
    onSettled(data, error, variables) {
      console.log("创建操作完成（无论成功失败）");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    /**
     * mutate() 触发 mutation
     * 传入的参数会传给 mutationFn
     *
     * 【教学提示】
     * mutate() 是"触发并忘记"模式，不返回 Promise
     * 如果需要等待结果，使用 mutateAsync()
     */
    addMutation.mutate(newTitle.trim());
    setNewTitle("");
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 1：基础 Mutation - 创建待办事项</h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="输入待办事项标题..."
          disabled={addMutation.isPending}
          style={{ flex: 1, padding: "6px 12px" }}
        />
        <button
          type="submit"
          disabled={addMutation.isPending || !newTitle.trim()}
          style={{ padding: "6px 16px" }}
        >
          {addMutation.isPending ? "创建中..." : "添加"}
        </button>
      </form>

      {/* mutation 状态展示 */}
      <div style={{ marginTop: "12px", fontSize: "13px" }}>
        <p>
          <strong>状态：</strong>
          {addMutation.isIdle && "空闲"}
          {addMutation.isPending && "进行中..."}
          {addMutation.isSuccess && `成功！返回数据: ${JSON.stringify(addMutation.data)}`}
          {addMutation.isError && `失败！错误: ${addMutation.error?.message}`}
        </p>
      </div>

      {/* 重置 mutation 状态 */}
      {addMutation.isSuccess && (
        <button
          onClick={() => addMutation.reset()}
          style={{ marginTop: "8px", fontSize: "13px" }}
        >
          重置状态
        </button>
      )}
    </div>
  );
}

/**
 * 示例 2：Mutation 成功后使查询缓存失效
 *
 * 【教学提示】
 * 这是最常见的模式！当你修改了服务端数据后，需要让相关的查询缓存失效，
 * 这样 React Query 会自动重新获取最新数据。
 *
 * 使用 queryClient.invalidateQueries() 来使缓存失效。
 */
function MutationWithInvalidationExample() {
  const [newTitle, setNewTitle] = useState("");
  const queryClient = useQueryClient();

  // 查询待办事项列表
  const { data: todos = [], isPending } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const addMutation = useMutation({
    mutationFn: createTodo,
    /**
     * onSuccess 中使缓存失效
     *
     * 【教学提示】
     * invalidateQueries 会：
     * 1. 将匹配的查询标记为"过期"
     * 2. 如果有组件正在使用这个查询，会自动重新获取
     *
     * queryKey 匹配规则：
     * - invalidateQueries({ queryKey: ["todos"] })
     *   → 匹配所有以 ["todos"] 开头的查询
     * - invalidateQueries({ queryKey: ["todos", 1] })
     *   → 精确匹配 ["todos", 1]
     * - invalidateQueries({ queryKey: ["todos"], exact: true })
     *   → 精确匹配 ["todos"]（不包含子键的）
     */
    onSuccess: () => {
      // 使 ["todos"] 相关的所有查询缓存失效
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      // 同样使缓存失效，列表会自动刷新
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addMutation.mutate(newTitle.trim());
    setNewTitle("");
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 2：Mutation + 缓存失效</h3>

      {/* 添加表单 */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="添加新待办..."
          disabled={addMutation.isPending}
          style={{ flex: 1, padding: "6px 12px" }}
        />
        <button type="submit" disabled={addMutation.isPending || !newTitle.trim()} style={{ padding: "6px 16px" }}>
          {addMutation.isPending ? "添加中..." : "添加"}
        </button>
      </form>

      {/* 待办事项列表 */}
      {isPending && <div>加载中...</div>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px",
              borderBottom: "1px solid #eee",
            }}
          >
            <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
              {todo.title}
            </span>
            <button
              onClick={() => deleteMutation.mutate(todo.id)}
              disabled={deleteMutation.isPending}
              style={{
                color: "red",
                border: "1px solid red",
                background: "none",
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              {deleteMutation.isPending ? "删除中..." : "删除"}
            </button>
          </li>
        ))}
      </ul>

      {/* 操作提示 */}
      <div style={{ fontSize: "13px", color: "#666", marginTop: "8px" }}>
        <p>添加或删除后，列表会自动刷新（因为 invalidateQueries 触发了重新获取）</p>
      </div>
    </div>
  );
}

// ============================================================================
// 第四部分：乐观更新（Optimistic Update）
// ============================================================================

/**
 * 示例 3：乐观更新 - 切换完成状态
 *
 * 【教学提示】
 * 乐观更新是一种 UX 模式：
 * 1. 用户点击操作后，立即更新 UI（不等服务端响应）
 * 2. 同时发送请求到服务端
 * 3. 如果成功 → 保持 UI 更新
 * 4. 如果失败 → 回滚 UI 到之前的状态
 *
 * 好处：用户感觉操作是"即时"的，体验更流畅
 * 风险：如果请求失败，需要正确回滚
 *
 * 实现步骤：
 * 1. 在 onMutate 中保存当前缓存数据（用于回滚）并更新缓存
 * 2. 在 onError 中回滚到之前的数据
 * 3. 在 onSettled 中重新获取数据（确保最终一致性）
 */
function OptimisticUpdateExample() {
  const queryClient = useQueryClient();

  const { data: todos = [], isPending } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTodo,

    /**
     * onMutate：在 mutation 开始之前执行
     *
     * 【教学提示】
     * onMutate 的返回值会作为 context 传递给 onError 和 onSettled
     * 这是实现乐观更新的关键！
     *
     * 执行顺序：onMutate → mutationFn → onSuccess/onError → onSettled
     */
    onMutate: async (todoId) => {
      // 步骤 1：取消任何正在进行的查询，避免它们覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // 步骤 2：保存当前缓存数据的快照（用于失败时回滚）
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // 步骤 3：乐观地更新缓存
      queryClient.setQueryData<Todo[]>(["todos"], (old) => {
        if (!old) return old;
        return old.map((todo) =>
          todo.id === todoId
            ? { ...todo, completed: !todo.completed }
            : todo
        );
      });

      // 步骤 4：返回包含之前数据的 context 对象
      // 这个 context 会在 onError 和 onSettled 中可用
      return { previousTodos };
    },

    /**
     * onError：mutation 失败时执行
     *
     * 【教学提示】
     * 参数说明：
     * - error: 错误对象
     * - variables: 传入 mutate() 的参数
     * - context: onMutate 返回的对象
     */
    onError: (error, todoId, context) => {
      // 步骤 5：如果失败，回滚到之前的数据
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
      console.error("乐观更新失败，已回滚:", error.message);
    },

    /**
     * onSettled：无论成功或失败都执行
     *
     * 【教学提示】
     * 这里我们重新获取数据，确保缓存和服务端最终一致
     * 即使乐观更新成功了，也可能有其他数据变化
     */
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 3：乐观更新 - 切换完成状态</h3>

      <div style={{ backgroundColor: "#fffbe6", padding: "12px", borderRadius: "4px", fontSize: "13px", marginBottom: "12px" }}>
        <strong>乐观更新说明：</strong>
        <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
          <li>点击复选框后，UI 立即更新（不等服务端响应）</li>
          <li>如果服务端返回失败，UI 会自动回滚</li>
          <li>操作完成后会重新获取数据确保一致性</li>
        </ul>
      </div>

      {isPending && <div>加载中...</div>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px",
              borderBottom: "1px solid #eee",
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleMutation.mutate(todo.id)}
              disabled={toggleMutation.isPending}
              style={{ cursor: "pointer" }}
            />
            <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
              {todo.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// 第五部分：乐观更新 - 编辑标题（带错误回滚演示）
// ============================================================================

/**
 * 示例 4：乐观更新 - 编辑标题（带错误回滚）
 *
 * 【教学提示】
 * 这个示例演示了更复杂的乐观更新场景：
 * - 编辑操作有 20% 的概率失败（模拟网络错误）
 * - 失败时 UI 会回滚到之前的标题
 * - 成功时 UI 保持新标题
 *
 * 注意观察：当更新失败时，输入框的值会自动恢复为原标题
 */
function OptimisticUpdateWithErrorExample() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const { data: todos = [], isPending } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const updateMutation = useMutation({
    mutationFn: updateTodoTitle,

    onMutate: async ({ id, title }) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // 保存当前数据快照
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // 乐观更新
      queryClient.setQueryData<Todo[]>(["todos"], (old) => {
        if (!old) return old;
        return old.map((todo) =>
          todo.id === id ? { ...todo, title } : todo
        );
      });

      return { previousTodos };
    },

    onError: (error, variables, context) => {
      // 回滚
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
      alert(`更新失败（已回滚）: ${error.message}`);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setEditingId(null);
    },
  });

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const saveEdit = (id: number) => {
    if (!editTitle.trim()) return;
    updateMutation.mutate({ id, title: editTitle.trim() });
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 4：乐观更新 - 编辑标题（20% 失败率）</h3>

      <div style={{ backgroundColor: "#fff1f0", padding: "12px", borderRadius: "4px", fontSize: "13px", marginBottom: "12px" }}>
        <strong>注意：</strong>更新操作有 20% 的概率失败。失败时 UI 会自动回滚到原标题。
        多试几次就能看到失败回滚的效果。
      </div>

      {isPending && <div>加载中...</div>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px",
              borderBottom: "1px solid #eee",
            }}
          >
            {editingId === todo.id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={updateMutation.isPending}
                  style={{ flex: 1, padding: "4px 8px" }}
                  autoFocus
                />
                <button
                  onClick={() => saveEdit(todo.id)}
                  disabled={updateMutation.isPending || !editTitle.trim()}
                  style={{ padding: "4px 12px" }}
                >
                  {updateMutation.isPending ? "保存中..." : "保存"}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  disabled={updateMutation.isPending}
                  style={{ padding: "4px 12px" }}
                >
                  取消
                </button>
              </>
            ) : (
              <>
                <span style={{ flex: 1 }}>{todo.title}</span>
                <button
                  onClick={() => startEdit(todo)}
                  style={{ padding: "4px 12px", fontSize: "13px" }}
                >
                  编辑
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// 第六部分：mutate vs mutateAsync
// ============================================================================

/**
 * 示例 5：mutate vs mutateAsync 的区别
 *
 * 【教学提示】
 * mutate()：
 * - "触发并忘记"模式
 * - 不返回 Promise（返回 void）
 * - 适合简单的操作，不需要等待结果
 * - 错误通过 onError 回调处理
 *
 * mutateAsync()：
 * - 返回 Promise
 * - 可以使用 try/catch 处理错误
 * - 可以 await 等待结果
 * - 适合需要等待结果后再执行后续操作的场景
 */
function MutateVsMutateAsyncExample() {
  const [result, setResult] = useState<string>("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  /**
   * 使用 mutate() 的方式
   * 不需要 await，错误通过 onError 回调处理
   */
  const handleMutate = () => {
    mutation.mutate(`mutate 创建的待办 ${Date.now()}`);
    setResult("mutate() 已触发（不等待结果）");
  };

  /**
   * 使用 mutateAsync() 的方式
   * 可以 await 等待结果，使用 try/catch 处理错误
   */
  const handleMutateAsync = async () => {
    try {
      const data = await mutation.mutateAsync(`mutateAsync 创建的待办 ${Date.now()}`);
      setResult(`mutateAsync() 成功！返回数据: ${JSON.stringify(data)}`);
    } catch (error) {
      setResult(`mutateAsync() 失败！错误: ${(error as Error).message}`);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 5：mutate vs mutateAsync</h3>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={handleMutate} disabled={mutation.isPending} style={{ padding: "6px 16px" }}>
          mutate()
        </button>
        <button onClick={handleMutateAsync} disabled={mutation.isPending} style={{ padding: "6px 16px" }}>
          mutateAsync()
        </button>
        <button onClick={() => mutation.reset()} style={{ padding: "6px 16px" }}>
          重置
        </button>
      </div>

      <div style={{ fontSize: "13px" }}>
        <p><strong>状态：</strong>
          {mutation.isIdle && "空闲"}
          {mutation.isPending && "进行中..."}
          {mutation.isSuccess && "成功"}
          {mutation.isError && "失败"}
        </p>
        <p><strong>结果：</strong>{result || "暂无"}</p>
      </div>

      <div style={{ backgroundColor: "#f6ffed", padding: "12px", borderRadius: "4px", fontSize: "13px", marginTop: "12px" }}>
        <strong>区别：</strong>
        <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
          <li>mutate(): 触发后不等待，错误通过 onError 回调处理</li>
          <li>mutateAsync(): 返回 Promise，可以用 try/catch 处理错误</li>
          <li>推荐：简单操作用 mutate()，需要等待结果用 mutateAsync()</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// 第七部分：useMutationState（v5 新特性）
// ============================================================================

/**
 * 示例 6：useMutationState - 获取所有 mutation 的状态
 *
 * 【教学提示】
 * useMutationState 是 v5 新增的 Hook，可以获取所有（或筛选后的）mutation 状态。
 *
 * 常见用途：
 * - 显示全局的 mutation 加载状态
 * - 统计正在进行的 mutation 数量
 * - 调试和监控 mutation 状态
 */
function MutationStateExample() {
  const queryClient = useQueryClient();

  // 创建两个独立的 mutation
  const mutation1 = useMutation({
    mutationFn: async (name: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return `${name} 完成`;
    },
  });

  const mutation2 = useMutation({
    mutationFn: async (name: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return `${name} 完成`;
    },
  });

  /**
   * useMutationState 获取所有 mutation 的状态
   *
   * 【教学提示】
   * - 不传参数：获取所有 mutation 的状态
   * - 传入 filters：可以按 mutationKey 等条件筛选
   *
   * 返回值是一个数组，每个元素是一个 mutation 的状态对象
   */
  const allMutations = useMutationState();

  // 统计正在进行的 mutation 数量
  const pendingCount = allMutations.filter((m) => m.status === "pending").length;

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 6：useMutationState（v5 新特性）</h3>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={() => mutation1.mutate("操作A")} disabled={mutation1.isPending} style={{ padding: "6px 16px" }}>
          {mutation1.isPending ? "操作A 进行中..." : "触发操作A"}
        </button>
        <button onClick={() => mutation2.mutate("操作B")} disabled={mutation2.isPending} style={{ padding: "6px 16px" }}>
          {mutation2.isPending ? "操作B 进行中..." : "触发操作B"}
        </button>
      </div>

      <div style={{ fontSize: "13px", marginBottom: "8px" }}>
        <p><strong>正在进行的 mutation 数量：</strong>{pendingCount}</p>
      </div>

      <div style={{ fontSize: "12px", backgroundColor: "#f5f5f5", padding: "12px", borderRadius: "4px" }}>
        <strong>所有 mutation 状态：</strong>
        <pre style={{ margin: "8px 0 0 0", whiteSpace: "pre-wrap", maxHeight: "200px", overflow: "auto" }}>
          {JSON.stringify(
            allMutations.map((m) => ({
              status: m.status,
              variables: m.variables,
              data: m.data,
            })),
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}

// ============================================================================
// 第八部分：应用根组件
// ============================================================================

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
        <h1>React Query v5 - Mutations 教程</h1>
        <p style={{ color: "#666" }}>
          本文件演示了 useMutation 的各种用法，包括基础用法、乐观更新、错误处理等。
        </p>

        <hr style={{ margin: "20px 0" }} />

        <BasicMutationExample />
        <MutationWithInvalidationExample />
        <OptimisticUpdateExample />
        <OptimisticUpdateWithErrorExample />
        <MutateVsMutateAsyncExample />
        <MutationStateExample />
      </div>
    </QueryClientProvider>
  );
}
