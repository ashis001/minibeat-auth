from fastapi import Request, HTTPException
from typing import List
import ipaddress


def check_ip_whitelist(client_ip: str, allowed_ips: List[str]) -> bool:
    """
    Check if client IP is in the whitelist.
    Supports individual IPs and CIDR ranges.
    """
    if not allowed_ips:
        return True  # No restrictions if list is empty
    
    try:
        client_ip_obj = ipaddress.ip_address(client_ip)
        
        for allowed in allowed_ips:
            # Check if it's a CIDR range
            if '/' in allowed:
                if client_ip_obj in ipaddress.ip_network(allowed, strict=False):
                    return True
            else:
                # Individual IP
                if str(client_ip_obj) == allowed:
                    return True
        
        return False
    except ValueError:
        return False


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    # Check for proxy headers first
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct connection
    if request.client:
        return request.client.host
    
    return "0.0.0.0"


async def ip_whitelist_middleware(request: Request, allowed_ips: List[str]):
    """Middleware to check IP whitelist"""
    client_ip = get_client_ip(request)
    
    if not check_ip_whitelist(client_ip, allowed_ips):
        raise HTTPException(
            status_code=403,
            detail=f"IP address {client_ip} is not whitelisted for this organization"
        )
