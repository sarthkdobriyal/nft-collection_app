// Next.js API route support: https://nextjs.org/docs/api-routes/introduction





export default function handler(req, res) {
    const tokenId = req.query.tokenId;
    const name = `srtk #${tokenId}`
    const description = "NFT collection for people who knows Sarthk Dobriyal "
    const img = `https://github.com/sarthkdobriyal/nft-collection_app/blob/master/public/${Number(tokenId) - 1}.svg`;

    return res.json({
        name,
        description,
        img,
    })


}
