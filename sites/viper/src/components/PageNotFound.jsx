export default function PageNotFound({ notFound }) {
  const nf = notFound || {};
  return (
    <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"var(--colors--onyx)"}}>
      <div style={{textAlign:"center",maxWidth:"32rem",margin:"0 auto",padding:"0 24px"}}>
        <span style={{display:"block",fontFamily:"var(--font-families--accent-font)",color:"var(--colors--gold-bright)",fontSize:"6rem",lineHeight:1,marginBottom:"24px"}}>{nf?.code || "404"}</span>
        <h1 style={{fontFamily:"var(--font-families--accent-font)",color:"var(--colors--pure)",fontSize:"1.5rem",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"16px"}}>{nf?.heading || "Page Not Found"}</h1>
        <p style={{color:"var(--colors--ivory)",opacity:0.6,fontFamily:"var(--font-families--body-font)",fontSize:"1rem",marginBottom:"32px"}}>
          {nf?.body || "The page you're looking for doesn't exist."}
        </p>
        <a href="/" aria-label={nf?.return_aria || "Return to home page"} style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"12px 48px",border:"1px solid var(--colors--pure)",color:"var(--colors--pure)",textDecoration:"none",fontFamily:"var(--font-families--body-font)",fontSize:"1rem",borderRadius:"26px"}}>
          {nf?.return_link || "Return Home"}
        </a>
      </div>
    </section>
  );
}
