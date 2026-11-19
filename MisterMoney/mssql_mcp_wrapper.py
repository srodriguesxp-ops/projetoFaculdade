"""Wrapper para microsoft-sql-server-mcp 0.1.0.

Contorna dois problemas do pacote original:
1. Ele usa decorators removidos no mcp SDK 2.x -> usamos o venv com mcp<2.
2. Ele passa `encrypt` para pymssql.connect(), que nao aceita esse argumento.
"""

import asyncio

import pymssql

_original_connect = pymssql.connect


def _connect(*args, **kwargs):
    kwargs.pop("encrypt", None)
    return _original_connect(*args, **kwargs)


pymssql.connect = _connect

from mssql_mcp_server.server import main  # noqa: E402


if __name__ == "__main__":
    asyncio.run(main())
