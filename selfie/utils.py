import asyncio


async def run_potentially_async_function(func, *args, **kwargs):
    if asyncio.iscoroutinefunction(func):
        # If func is an async function, await it
        return await func(*args, **kwargs)
    else:
        # If func is a synchronous function, run it in the executor
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, func, *args, **kwargs)
