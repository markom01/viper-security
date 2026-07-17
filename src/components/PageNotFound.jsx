import React from "react";

export default function PageNotFound() {
  return (
    <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"#010101"}}>
      <div style={{textAlign:"center",maxWidth:"32rem",margin:"0 auto",padding:"0 24px"}}>
        <span style={{display:"block",fontFamily:"'Playfair Display',serif",color:"#917148",fontSize:"6rem",lineHeight:1,marginBottom:"24px"}}>404</span>
        <h1 style={{fontFamily:"'Playfair Display',serif",color:"#fff",fontSize:"1.5rem",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"16px"}}>Page Not Found</h1>
        <p style={{color:"rgba(255,255,255,0.6)",fontFamily:"'Work Sans',sans-serif",fontSize:"1rem",marginBottom:"32px"}}>
          The page you're looking for doesn't exist.
        </p>
        <a href="/" style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"12px 48px",border:"1px solid #fff",color:"#fff",textDecoration:"none",fontFamily:"'Work Sans',sans-serif",fontSize:"1rem",borderRadius:"26px"}}>
          Return Home
        </a>
      </div>
    </section>
  );
}
