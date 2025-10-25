from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.database import get_db
from app.models.user import User, UserRole
from app.api.dependencies import get_current_admin
from pydantic import BaseModel

router = APIRouter(prefix="/database", tags=["database"])


class QueryRequest(BaseModel):
    query: str


class QueryResult(BaseModel):
    columns: List[str]
    rows: List[List[Any]]
    row_count: int


@router.get("/tables")
async def list_tables(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all tables in the database (Admin only)"""
    inspector = inspect(db.bind)
    tables = inspector.get_table_names()
    
    table_info = []
    for table_name in tables:
        columns = inspector.get_columns(table_name)
        result = db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
        row_count = result.scalar()
        
        table_info.append({
            "name": table_name,
            "columns": len(columns),
            "rows": row_count
        })
    
    return table_info


@router.get("/tables/{table_name}/schema")
async def get_table_schema(
    table_name: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get schema for a specific table (Admin only)"""
    inspector = inspect(db.bind)
    
    if table_name not in inspector.get_table_names():
        raise HTTPException(status_code=404, detail="Table not found")
    
    columns = inspector.get_columns(table_name)
    primary_keys = inspector.get_pk_constraint(table_name)
    foreign_keys = inspector.get_foreign_keys(table_name)
    indexes = inspector.get_indexes(table_name)
    
    return {
        "table_name": table_name,
        "columns": columns,
        "primary_keys": primary_keys,
        "foreign_keys": foreign_keys,
        "indexes": indexes
    }


@router.get("/tables/{table_name}/data")
async def get_table_data(
    table_name: str,
    limit: int = 100,
    offset: int = 0,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get data from a specific table with pagination (Admin only)"""
    inspector = inspect(db.bind)
    
    if table_name not in inspector.get_table_names():
        raise HTTPException(status_code=404, detail="Table not found")
    
    # Get column names
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    
    # Get data
    query = text(f"SELECT * FROM {table_name} LIMIT :limit OFFSET :offset")
    result = db.execute(query, {"limit": limit, "offset": offset})
    rows = [list(row) for row in result.fetchall()]
    
    # Get total count
    count_query = text(f"SELECT COUNT(*) FROM {table_name}")
    total_count = db.execute(count_query).scalar()
    
    return {
        "columns": columns,
        "rows": rows,
        "total_count": total_count,
        "limit": limit,
        "offset": offset
    }


@router.post("/query", response_model=QueryResult)
async def execute_query(
    query_request: QueryRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Execute a SQL query (Admin only, SELECT queries only for safety)"""
    query = query_request.query.strip()
    
    # Only allow SELECT queries for safety
    if not query.upper().startswith("SELECT"):
        raise HTTPException(
            status_code=400,
            detail="Only SELECT queries are allowed for safety"
        )
    
    try:
        result = db.execute(text(query))
        rows = result.fetchall()
        
        if rows:
            columns = list(rows[0]._mapping.keys())
            data = [[getattr(row, col) for col in columns] for row in rows]
        else:
            columns = []
            data = []
        
        return QueryResult(
            columns=columns,
            rows=data,
            row_count=len(data)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Query error: {str(e)}")
