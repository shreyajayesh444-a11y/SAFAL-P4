import { useEffect, useState } from "react";
import jsQR from "jsqr";
import QRCode from "qrcode";
import "./App.css";
import { supabase } from "./supabase";

function App() {
  const [screen, setScreen] = useState("home");
  const [selectedRole, setSelectedRole] = useState("");

  const [productCode, setProductCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const [selectedScan, setSelectedScan] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  const [product, setProduct] = useState(null);
  const [verification, setVerification] = useState(null);

  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const [profileName, setProfileName] = useState("");

  const [businessName, setBusinessName] =
    useState("");

  const [businessLocation, setBusinessLocation] =
    useState("");

  const [registrationNumber, setRegistrationNumber] =
    useState("");
  const [profileBio, setProfileBio] = useState("");
  const [editingRole, setEditingRole] = useState(null);

  const [currentProfile, setCurrentProfile] =
    useState(null);
  const [roleProfiles, setRoleProfiles] =
    useState([]);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [profileError, setProfileError] =
    useState("");

  const [producerProducts, setProducerProducts] = useState([]);
  const [producerQrCodes, setProducerQrCodes] = useState({});
  const [producerRecords, setProducerRecords] = useState([]);
  const [producerLoading, setProducerLoading] = useState(false);
  const [producerError, setProducerError] = useState("");

  const [producerProductName, setProducerProductName] = useState("");
  const [producerProductCode, setProducerProductCode] = useState("");
  const [producerBatchId, setProducerBatchId] = useState("");
  const [producerCategory, setProducerCategory] = useState("");
  const [producerRecordProductId, setProducerRecordProductId] = useState("");
  const [producerProductionDate, setProducerProductionDate] = useState("");
  const [producerQuantity, setProducerQuantity] = useState("");
  const [producerLocation, setProducerLocation] = useState("");
  const [producerDetails, setProducerDetails] = useState("");

  const [processorProducts, setProcessorProducts] = useState([]);
  const [processorLoading, setProcessorLoading] = useState(false);
  const [processorError, setProcessorError] = useState("");

  const [processorProductId, setProcessorProductId] = useState("");
  const [processingType, setProcessingType] = useState("");
  const [processingDate, setProcessingDate] = useState("");
  const [processingLocation, setProcessingLocation] = useState("");
  const [quantityProcessed, setQuantityProcessed] = useState("");
  const [processingDetails, setProcessingDetails] = useState("");

  const [processorRecords, setProcessorRecords] = useState([]);

  const [distributorProducts, setDistributorProducts] = useState([]);
  const [distributorRecords, setDistributorRecords] = useState([]);
  const [distributorLoading, setDistributorLoading] = useState(false);
  const [distributorError, setDistributorError] = useState("");
  const [distributorProductId, setDistributorProductId] = useState("");
  const [distributionDate, setDistributionDate] = useState("");
  const [distributionFrom, setDistributionFrom] = useState("");
  const [distributionTo, setDistributionTo] = useState("");
  const [distributionQuantity, setDistributionQuantity] = useState("");
  const [distributionDetails, setDistributionDetails] = useState("");

  const [retailerProducts, setRetailerProducts] = useState([]);
  const [retailerRecords, setRetailerRecords] = useState([]);
  const [retailerLoading, setRetailerLoading] = useState(false);
  const [retailerError, setRetailerError] = useState("");
  const [retailerProductId, setRetailerProductId] = useState("");
  const [retailDate, setRetailDate] = useState("");
  const [retailLocation, setRetailLocation] = useState("");
  const [retailQuantity, setRetailQuantity] = useState("");
  const [retailDetails, setRetailDetails] = useState("");
  // =========================
  // EVIDENCE UPLOAD
  // =========================

  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidenceType, setEvidenceType] = useState("Other");
  const [evidenceUploads, setEvidenceUploads] = useState({});
  const [evidenceAiLoading, setEvidenceAiLoading] = useState({});
  const [creatorPin, setCreatorPin] = useState("");
  const [creatorAuthenticated, setCreatorAuthenticated] = useState(false);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [verificationConsoleLoading, setVerificationConsoleLoading] = useState(false);
  const [verificationConsoleError, setVerificationConsoleError] = useState("");
  const [reviewComments, setReviewComments] = useState({});
  const [reviewLoading, setReviewLoading] = useState({});

  const evidenceDefinitions = {
    producer: [
      { type: "Business / Manufacturing License", label: "BUSINESS / MANUFACTURING LICENSE" },
      { type: "FSSAI Approval", label: "FSSAI APPROVAL / LICENSE" },
      { type: "Inspection Record", label: "INSPECTION RECORD / CERTIFICATE" },
      { type: "Audit Report", label: "AUDIT REPORT" },
      { type: "Production Photo", label: "PRODUCTION PHOTOS" },
    ],
    processor: [
      { type: "Processing / Manufacturing License", label: "PROCESSING / MANUFACTURING LICENSE" },
      { type: "FSSAI Approval", label: "FSSAI APPROVAL / LICENSE" },
      { type: "Inspection Record", label: "PROCESSING INSPECTION RECORD / CERTIFICATE" },
      { type: "Audit Report", label: "AUDIT REPORT" },
      { type: "Processing Photo", label: "PROCESSING PHOTOS" },
    ],
    distributor: [
      { type: "Warehouse / Distribution License", label: "WAREHOUSE / DISTRIBUTION LICENSE" },
      { type: "FSSAI Approval", label: "FSSAI APPROVAL / LICENSE (IF APPLICABLE)" },
      { type: "Dispatch / Shipping Document", label: "DISPATCH / SHIPPING DOCUMENTS" },
      { type: "Warehouse Inspection", label: "WAREHOUSE INSPECTION RECORD / CERTIFICATE" },
      { type: "Shipment Photo", label: "SHIPMENT PHOTOS" },
    ],
    retailer: [
      { type: "Retail / Shop License", label: "RETAIL / SHOP LICENSE" },
      { type: "FSSAI Approval", label: "FSSAI APPROVAL / LICENSE (IF APPLICABLE)" },
      { type: "Store Inspection", label: "STORE INSPECTION RECORD / CERTIFICATE" },
      { type: "Audit Report", label: "AUDIT REPORT" },
      { type: "Product-at-Store Photo", label: "PRODUCT-AT-STORE PHOTOS" },
    ],
  };

  const setEvidenceSlotFiles = (type, files) => {
    const validFiles = Array.from(files || []).filter((file) => {
      const validType = file.type.startsWith("image/") || file.type === "application/pdf";
      const validSize = file.size <= 10 * 1024 * 1024;
      return validType && validSize;
    });
    setEvidenceUploads((previous) => ({ ...previous, [type]: validFiles }));
  };

  const getEvidenceItems = () =>
    Object.entries(evidenceUploads).flatMap(([type, files]) =>
      (files || []).map((file) => ({ evidenceType: type, file }))
    );

  const renderEvidenceSlots = (role) => {
    const definitions = evidenceDefinitions[role] || [];
    return (
      <div className="profile-field">
        <label>
          SUPPORTING EVIDENCE
          <span className="optional">ALL OPTIONAL</span>
        </label>
        <p className="description">
          Upload any available evidence for this stage. Every section is optional.
          You can upload multiple files in each section. Images and PDF files up to 10 MB each.
        </p>
        <div style={{ marginTop: "14px" }}>
          {definitions.map((definition) => {
            const files = evidenceUploads[definition.type] || [];
            return (
              <div key={definition.type} style={{ marginTop: "14px", padding: "14px", border: "1px solid rgba(0,0,0,.10)", borderRadius: "10px" }}>
                <label style={{ display: "block", marginBottom: "7px" }}>
                  {definition.label}
                  <span className="optional">OPTIONAL</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => {
                    setEvidenceSlotFiles(definition.type, e.target.files);
                    e.target.value = "";
                  }}
                />
                {files.length > 0 && (
                  <div style={{ marginTop: "9px" }}>
                    {files.map((file, index) => (
                      <p key={`${file.name}-${index}`} style={{ margin: "4px 0" }}>✓ {file.name}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHistoryEvidenceUploader = ({ item, role, recordType, recordDate, setError, onSuccess }) => {
    const definitions = evidenceDefinitions[role] || [];
    return (
      <div style={{ marginTop: "16px" }}>
        <strong>UPLOAD ADDITIONAL EVIDENCE</strong>
        <p className="description" style={{ marginTop: "6px" }}>
          Each evidence type has its own optional upload space. Multiple files can be added to each section.
        </p>
        {definitions.map((definition) => (
          <div key={definition.type} style={{ marginTop: "12px", padding: "12px", border: "1px solid rgba(0,0,0,.10)", borderRadius: "10px" }}>
            <label style={{ display: "block", marginBottom: "6px" }}>
              {definition.label}
              <span className="optional">OPTIONAL</span>
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                try {
                  await uploadAdditionalEvidence({
                    productId: item.product_id,
                    role,
                    recordType,
                    recordDate,
                    files,
                    evidenceTypeOverride: definition.type,
                    onSuccess,
                  });
                  showSuccessMessage(`${definition.label} uploaded successfully.`);
                } catch (error) {
                  setError(error.message || "Unable to upload evidence.");
                }
                e.target.value = "";
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  /* =========================
     LOAD RECENT SCANS
  ========================= */

  useEffect(() => {
    loadRecentScans();
    loadSavedProfile();
  }, []);

  // Refresh the selected product's evidence whenever the consumer reaches
  // a decision/score screen. This prevents an older selectedScan snapshot
  // from keeping a stale 0% score after evidence has been approved.
  useEffect(() => {
    const scoreScreens = [
      "decision",
      "purchase",
      "purchase-complete",
    ];

    const productId =
      selectedScan?.product_id ||
      selectedScan?.productId ||
      product?.id;

    if (!scoreScreens.includes(screen) || !productId) return;

    let cancelled = false;

    const refreshSelectedVerification = async () => {
      try {
        const { data: evidenceData, error } = await supabase
          .from("supply_chain_evidence")
          .select("role, evidence_type, verification_status")
          .eq("product_id", productId);

        if (error) throw error;
        if (cancelled) return;

        const summary = getEvidenceVerificationSummary(
          evidenceData || []
        );

        setSelectedScan((previous) =>
          previous &&
          (previous.product_id === productId ||
            previous.productId === productId)
            ? {
                ...previous,
                product_id: productId,
                status: summary.status,
                score: summary.confidenceScore,
              }
            : previous
        );

        setVerification((previous) =>
          previous && previous.product_id === productId
            ? {
                ...previous,
                status: summary.status,
                confidence_score: summary.confidenceScore,
              }
            : {
                product_id: productId,
                status: summary.status,
                confidence_score: summary.confidenceScore,
              }
        );
      } catch (error) {
        console.error(
          "REFRESH VERIFICATION SCORE ERROR:",
          error
        );
      }
    };

    refreshSelectedVerification();

    return () => {
      cancelled = true;
    };
  }, [screen, selectedScan?.product_id, selectedScan?.productId, product?.id]);

  async function loadRecentScans() {
    try {
      const { data, error } = await supabase
        .from("recent_scans")
        .select(`
          id,
          verification_status,
          scanned_at,
          product_id,
          products (
            id,
            product_name,
            product_code,
            batch_id,
            category,
            image_url
          )
        `)
        .order("scanned_at", {
          ascending: false,
        })
        .limit(10);

      if (error) {
        console.error(
          "LOAD RECENT SCANS ERROR:",
          error
        );

        return;
      }

      const uniqueScans = [];
        const seenProducts = new Set();

        (data || []).forEach((scan) => {
          if (!scan.products) return;

          const productKey =
            scan.product_id || scan.products.product_code;

          if (seenProducts.has(productKey)) return;

          seenProducts.add(productKey);
          uniqueScans.push(scan);
        });

        const formattedScans = await Promise.all(
          uniqueScans.map(async (scan) => {

            const {
              data: verificationData,
              error: verificationError,
            } = await supabase
              .from("verification_results")
              .select(
                "confidence_score, status"
              )
              .eq(
                "product_id",
                scan.product_id
              )
              .order("checked_at", {
                ascending: false,
              })
              .limit(1)
              .single();

            if (verificationError) {
              console.error(
                "RECENT SCORE ERROR:",
                verificationError
              );
            }

            return {
              id: scan.id,

              product_id: scan.product_id,

              name:
                scan.products.product_name,

              code:
                scan.products.product_code,

              batchId:
                scan.products.batch_id,

              category:
                scan.products.category,

              image:
                scan.products.image_url,

              status:
                verificationData?.status ||
                scan.verification_status,

              score:
                verificationData?.confidence_score ??
                0,

              date: new Date(
                scan.scanned_at
              ).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              ),

              time: new Date(
                scan.scanned_at
              ).toLocaleTimeString(
                "en-US",
                {
                  hour: "numeric",
                  minute: "2-digit",
                }
              ),

              evidence: [],
            };
          })
      );

      setRecentScans(formattedScans);

    } catch (error) {
      console.error(
        "RECENT SCANS ERROR:",
        error
      );
    }
  }
  async function loadSavedProfile() {
    try {
      const savedProfile =
        localStorage.getItem(
          "safal_profile"
        );

      if (!savedProfile) return;

      const parsedProfile =
        JSON.parse(savedProfile);

      if (!parsedProfile?.id) {
        localStorage.removeItem(
          "safal_profile"
        );
        return;
      }

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq(
          "id",
          parsedProfile.id
        )
        .single();

      if (
        profileError ||
        !profileData
      ) {
        console.error(
          "PROFILE LOAD ERROR:",
          profileError
        );

        localStorage.removeItem(
          "safal_profile"
        );

        return;
      }

      const {
        data: savedRoles,
        error: rolesError,
      } = await supabase
        .from("role_profiles")
        .select("*")
        .eq(
          "profile_id",
          profileData.id
        );

      if (rolesError) {
        console.error(
          "ROLE PROFILES ERROR:",
          rolesError
        );
      }

      setCurrentProfile(
        profileData
      );

      setRoleProfiles(
        savedRoles || []
      );

      /*
        Restore the previously
        selected active role
      */

      const activeRole =
        parsedProfile.activeRole ||
        parsedProfile.role ||
        profileData.role ||
        "";

      setSelectedRole(
        activeRole
      );

      localStorage.setItem(
        "safal_profile",
        JSON.stringify({
          ...profileData,
          activeRole,
        })
      );

    } catch (error) {

      console.error(
        "LOAD SAVED PROFILE ERROR:",
        error
      );

      localStorage.removeItem(
        "safal_profile"
      );
    }
  }
  /* =========================
     QR IMAGE UPLOAD
  ========================= */

  const handleQRUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setScanError("");
    setLoading(true);

    const image = new Image();
    const imageUrl = URL.createObjectURL(file);

    image.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const qrCode = jsQR(
          imageData.data,
          imageData.width,
          imageData.height,
          {
            inversionAttempts: "attemptBoth",
          }
        );

        URL.revokeObjectURL(imageUrl);

        if (!qrCode?.data) {
          setLoading(false);

          setScanError(
            "No readable QR code was found in this image."
          );

          return;
        }

        const decodedCode = qrCode.data
          .trim()
          .toUpperCase();

        setProductCode(decodedCode);

        await verifyProduct(decodedCode);
      } catch (error) {
        console.error("QR UPLOAD ERROR:", error);

        setScanError(
          "The QR image could not be processed."
        );

        setLoading(false);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);

      setScanError(
        "The selected image could not be loaded."
      );

      setLoading(false);
    };

    image.src = imageUrl;

    event.target.value = "";
  };

  /* =========================
     SUPABASE VERIFICATION
  ========================= */
  async function loadProductEvidence(productId, supplyChainData = []) {
    const { data: evidenceData, error: evidenceError } = await supabase
      .from("supply_chain_evidence")
      .select(`
        id,
        product_id,
        supply_chain_record_id,
        role,
        evidence_type,
        file_name,
        file_path,
        mime_type,
        verification_status,
        created_at
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (evidenceError) throw evidenceError;

    const recordById = new Map(
      (supplyChainData || []).map((record) => [
        record.id,
        record
      ])
    );

    return (evidenceData || []).map((item) => {
      const record = recordById.get(
        item.supply_chain_record_id
      );

      return {
        id: item.id,

        stage: item.role
          ? item.role.toUpperCase()
          : "EVIDENCE",

        title:
          item.evidence_type ||
          "Evidence",

        detail:
          item.file_name ||
          "Evidence file",

        description: [
          record?.location,

          record?.record_date
            ? new Date(
                record.record_date
              ).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                }
              )
            : null
        ]
          .filter(Boolean)
          .join(" • "),

        status:
          item.verification_status ||
          "pending",

        role: item.role,

        location:
          record?.location || null,

        facility:
          record?.facility_name || null,

        recordDate:
          record?.record_date || null,

        evidenceType:
          item.evidence_type,

        fileName:
          item.file_name,

        filePath:
          item.file_path
      };
    });
  }

  async function verifyProduct(codeToCheck = productCode) {
    const code = codeToCheck.trim().toUpperCase();

    if (!code) {
      setScanError("Enter a product code.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setScanError("");

    try {
      const {
        data: productData,
        error: productError,
      } = await supabase
        .from("products")
        .select("*")
        .eq("product_code", code)
        .single();

      if (productError || !productData) {
        console.error(
          "PRODUCT ERROR:",
          productError
        );

        setProduct(null);
        setVerification(null);
        setScreen("not-found");

        return;
      }

      const {
        data: verificationData,
        error: verificationError,
      } = await supabase
        .from("verification_results")
        .select("*")
        .eq("product_id", productData.id)
        .order("checked_at", {
          ascending: false,
        })
        .limit(1)
        .single();

      let resolvedVerification = verificationData;

      if (verificationError || !verificationData) {
        console.warn(
          "No verification record found. Using initial pending verification state.",
          verificationError
        );

        resolvedVerification = {
          product_id: productData.id,
          status: "partially_verified",
          confidence_score: 0,
          checked_at: new Date().toISOString(),
        };
      }

      const {
        data: supplyChainData,
        error: supplyChainError,
      } = await supabase
        .from("supply_chain_records")
        .select("*")
        .eq("product_id", productData.id)
        .order("record_date", {
          ascending: true,
        });

      if (supplyChainError) {
        console.error(
          "SUPPLY CHAIN ERROR:",
          supplyChainError
        );

        setScanError(
          "Product found, but its supply-chain records could not be loaded."
        );

        return;
      }

      const evidence =
        await loadProductEvidence(
          productData.id,
          supplyChainData
        );

      // Always derive the public verification score from the actual
      // evidence records. This prevents a stale 0% value in
      // verification_results from overriding approved evidence.
      const evidenceSummary =
        getEvidenceVerificationSummary(evidence);

      resolvedVerification = {
        ...resolvedVerification,
        product_id: productData.id,
        status: evidenceSummary.status,
        confidence_score: evidenceSummary.confidenceScore,
        checked_at:
          resolvedVerification?.checked_at ||
          new Date().toISOString(),
      };

      setProduct(productData);
      setVerification(resolvedVerification);

      const newScan = {
        id: `${productData.id}-${Date.now()}`,

        product_id: productData.id,

        name: productData.product_name,

        code: productData.product_code,

        batchId: productData.batch_id,

        category: productData.category,

        type: "Product record verification",

        image:
          productData.image_url ||
          null,

        status: resolvedVerification.status,

        score:
          resolvedVerification.confidence_score ??
          0,

        date: new Date().toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        ),

        time: "Just now",

        evidence,
      };

      setSelectedScan(newScan);

      const {
        data: savedScan,
        error: recentScanError,
      } = await supabase
        .from("recent_scans")
        .insert({
          product_id: productData.id,

          verification_status:
            resolvedVerification.status,
        })
        .select()
        .single();

      if (recentScanError) {
        console.error(
          "SAVE RECENT SCAN ERROR:",
          recentScanError
        );
      }

      const scanWithDatabaseId = {
        ...newScan,

        id:
          savedScan?.id ||
          newScan.id,
      };

      setSelectedScan(
        scanWithDatabaseId
      );

      setRecentScans((previous) => [
        scanWithDatabaseId,

        ...previous.filter(
          (scan) =>
            scan.code !==
            productData.product_code
        ),
      ]);

      if (
        resolvedVerification.status ===
        "verified"
      ) {
        setScreen("result");
      } else if (
        resolvedVerification.status ===
        "partially_verified"
      ) {
        setScreen("partial");
      } else if (
        resolvedVerification.status ===
        "flagged"
      ) {
        setScreen("flagged");
      } else {
        setScreen("not-found");
      }
    } catch (error) {
      console.error(
        "FULL ERROR:",
        error
      );

      setScanError(
        "Something went wrong while verifying this product."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     NAVIGATION
  ========================= */

  const goToScan = () => {
    setProductCode("");
    setShowCodeInput(false);
    setScanError("");
    setLoading(false);

    setScreen("scan");
  };

  const openRecentScan = async (scan) => {
    setLoading(true);

    try {
      const {
        data: productData,
        error: productError,
      } = await supabase
        .from("products")
        .select("*")
        .eq(
          "product_code",
          scan.code
        )
        .single();

      if (productError || !productData) {
        console.error(
          "RECENT PRODUCT ERROR:",
          productError
        );

        return;
      }

      const {
        data: verificationData,
        error: verificationError,
      } = await supabase
        .from("verification_results")
        .select("*")
        .eq(
          "product_id",
          productData.id
        )
        .order(
          "checked_at",
          {
            ascending: false,
          }
        )
        .limit(1)
        .single();

      if (
        verificationError ||
        !verificationData
      ) {
        console.error(
          "RECENT VERIFICATION ERROR:",
          verificationError
        );

        return;
      }

      const {
        data: supplyChainData,
        error: supplyChainError,
      } = await supabase
        .from("supply_chain_records")
        .select("*")
        .eq(
          "product_id",
          productData.id
        )
        .order(
          "record_date",
          {
            ascending: true,
          }
        );

      if (supplyChainError) {
        console.error(
          "RECENT SUPPLY CHAIN ERROR:",
          supplyChainError
        );

        return;
      }

      const evidence =
        await loadProductEvidence(
          productData.id,
          supplyChainData
        );

      const evidenceSummary =
        getEvidenceVerificationSummary(evidence);

      const fullScan = {
        ...scan,

        product_id: productData.id,

        name:
          productData.product_name,

        code:
          productData.product_code,

        batchId:
          productData.batch_id,

        category:
          productData.category,

        image:
          productData.image_url ||
          null,

        status:
          evidenceSummary.status,

        score:
          evidenceSummary.confidenceScore,

        evidence,
      };

      setProduct(productData);

      setVerification(
        verificationData
      );

      setSelectedScan(fullScan);

      if (
        verificationData.status ===
        "verified"
      ) {
        setScreen("result");
      } else if (
        verificationData.status ===
        "partially_verified"
      ) {
        setScreen("partial");
      } else if (
        verificationData.status ===
        "flagged"
      ) {
        setScreen("flagged");
      } else {
        setScreen("not-found");
      }
    } catch (error) {
      console.error(
        "OPEN RECENT SCAN ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const resetProducerForm = () => {
    setProducerProductName("");
    setProducerProductCode("");
    setProducerBatchId("");
    setProducerCategory("");
    setProducerProductionDate("");
    setProducerQuantity("");
    setProducerLocation("");
    setProducerDetails("");
    setEvidenceFiles([]);
    setEvidenceType("Other");
    setEvidenceUploads({});
    setProducerError("");
  };

  const loadProducerProducts = async () => {
    if (!currentProfile?.id) return;
    setProducerLoading(true);
    setProducerError("");
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, product_name, product_code, batch_id, category, created_at")
        .eq("producer_id", currentProfile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const products = data || [];
      setProducerProducts(products);

      const qrEntries = await Promise.all(
        products.map(async (item) => {
          try {
            const qr = await QRCode.toDataURL(item.product_code, {
              width: 220,
              margin: 2,
              errorCorrectionLevel: "M",
            });
            return [item.id, qr];
          } catch (qrError) {
            console.error("PRODUCT QR GENERATION ERROR:", qrError);
            return [item.id, null];
          }
        })
      );

      setProducerQrCodes(Object.fromEntries(qrEntries));
    } catch (error) {
      console.error("PRODUCER PRODUCTS LOAD ERROR:", error);
      setProducerError(error.message || "Unable to load your products.");
    } finally {
      setProducerLoading(false);
    }
  };

  const loadProducerRecords = async () => {
    if (!currentProfile?.id) return;
    setProducerLoading(true);
    setProducerError("");
    try {
      const { data, error } = await supabase
        .from("producer_records")
        .select(`
          id, product_id, production_date, quantity, production_location,
          production_details, created_at,
          products ( product_name, product_code, batch_id, category )
        `)
        .eq("profile_id", currentProfile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: evidenceData, error: evidenceError } = await supabase
        .from("supply_chain_evidence")
        .select("id, product_id, supply_chain_record_id, evidence_type, file_name, file_path, mime_type, verification_status, created_at")
        .eq("profile_id", currentProfile.id)
        .eq("role", "producer")
        .order("created_at", { ascending: false });
      if (evidenceError) throw evidenceError;

      const enriched = (data || []).map((record) => ({
        ...record,
        evidence: (evidenceData || []).filter(
          (item) => item.product_id === record.product_id
        ),
      }));

      setProducerRecords(enriched);
    } catch (error) {
      console.error("PRODUCER RECORDS LOAD ERROR:", error);
      setProducerError(error.message || "Unable to load production records.");
    } finally {
      setProducerLoading(false);
    }
  };
  const resetProducerRecordForm = () => {
  setProducerRecordProductId("");
  setProducerProductionDate("");
  setProducerQuantity("");
  setProducerLocation("");
  setProducerDetails("");
  setEvidenceFiles([]);
  setEvidenceType("Other");
  setEvidenceUploads({});
  setProducerError("");
};
// =========================
// SAVE EVIDENCE FILES
// =========================

async function saveEvidenceFiles({ productId, supplyChainRecordId, role, evidenceItems = [] }) {
  if (!evidenceItems.length) return;
  if (!currentProfile?.id) throw new Error("Profile not found.");

  for (const item of evidenceItems) {
    const file = item.file;
    const evidenceTypeForFile = item.evidenceType || "Other";
    const validType = file.type.startsWith("image/") || file.type === "application/pdf";
    const validSize = file.size <= 10 * 1024 * 1024;
    if (!validType) throw new Error("Only image files and PDF files are supported.");
    if (!validSize) throw new Error("Each evidence file must be 10 MB or smaller.");

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${productId}/${role}/${supplyChainRecordId}/${crypto.randomUUID()}_${safeFileName}`;

    const { error: uploadError } = await supabase.storage.from("safal-evidence").upload(filePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { error: evidenceError } = await supabase.from("supply_chain_evidence").insert({
      product_id: productId,
      supply_chain_record_id: supplyChainRecordId,
      profile_id: currentProfile.id,
      role,
      evidence_type: evidenceTypeForFile,
      file_name: file.name,
      file_path: filePath,
      mime_type: file.type || null,
      verification_status: "pending",
    });
    if (evidenceError) throw evidenceError;
  }
}

async function uploadAdditionalEvidence({
  productId,
  role,
  recordType,
  recordDate,
  files,
  evidenceTypeOverride,
  onSuccess,
}) {
  if (!currentProfile?.id) {
    throw new Error("Profile not found.");
  }

  if (!files?.length) return;

  let recordQuery = supabase
    .from("supply_chain_records")
    .select("id")
    .eq("product_id", productId)
    .eq("contributor_id", currentProfile.id)
    .eq("role", role)
    .eq("record_type", recordType)
    .order("created_at", { ascending: false })
    .limit(1);

  recordQuery = recordDate
    ? recordQuery.eq("record_date", recordDate)
    : recordQuery.is("record_date", null);

  const { data: supplyChainRecord, error: recordError } =
    await recordQuery.maybeSingle();

  if (recordError) throw recordError;
  if (!supplyChainRecord?.id) {
    throw new Error("The linked supply-chain record could not be found.");
  }

  for (const file of files) {
    const validType =
      file.type.startsWith("image/") ||
      file.type === "application/pdf";
    const validSize = file.size <= 10 * 1024 * 1024;

    if (!validType) {
      throw new Error("Only image files and PDF files are supported.");
    }
    if (!validSize) {
      throw new Error("Each evidence file must be 10 MB or smaller.");
    }

    const safeFileName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const filePath =
      `${productId}/${role}/${supplyChainRecord.id}/${crypto.randomUUID()}_${safeFileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from("safal-evidence")
      .upload(filePath, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { error: evidenceError } = await supabase
      .from("supply_chain_evidence")
      .insert({
        product_id: productId,
        supply_chain_record_id: supplyChainRecord.id,
        profile_id: currentProfile.id,
        role,
        evidence_type: evidenceTypeOverride || evidenceType,
        file_name: file.name,
        file_path: filePath,
        mime_type: file.type || null,
        verification_status: "pending",
      });

    if (evidenceError) throw evidenceError;
  }

  if (onSuccess) await onSuccess();
}

async function viewEvidenceFile(filePath) {
  const { data, error } = await supabase
    .storage
    .from("safal-evidence")
    .createSignedUrl(filePath, 300);

  if (error) throw error;
  if (!data?.signedUrl) {
    throw new Error("Unable to create evidence preview link.");
  }

  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

async function analyzeEvidenceWithAI(evidence) {
  if (!evidence?.id) throw new Error("Evidence record not found.");
  setEvidenceAiLoading((p) => ({ ...p, [evidence.id]: true }));
  try {
    const { data, error } = await supabase.functions.invoke("verify-evidence", {
      body: { evidenceId: evidence.id, role: evidence.role, roleRecordId: evidence.role_record_id || null, productId: evidence.product_id, recordType: evidence.record?.record_type || null, recordDate: evidence.record?.record_date || null },
    });
    if (error) throw error;
    const result = data?.result || data;
    if (!result) throw new Error("The AI verification service returned no result.");
    const aiRecommendation = result.recommendation || result.ai_recommendation || "review";
    const aiStatus = result.status || result.ai_status || aiRecommendation;
    const aiConfidence = result.confidence ?? result.ai_confidence ?? null;
    const aiFindings = result.findings || result.ai_findings || result.summary || "AI analysis completed. Human review is still required.";
    const aiDocumentType = result.document_type || result.ai_document_type || null;
    const aiRiskLevel = result.risk_level || result.ai_risk_level || null;
    const { error: updateError } = await supabase.from("supply_chain_evidence").update({ ai_status: aiStatus, ai_recommendation: aiRecommendation, ai_confidence: aiConfidence, ai_findings: typeof aiFindings === "string" ? aiFindings : JSON.stringify(aiFindings), ai_document_type: aiDocumentType, ai_risk_level: aiRiskLevel, ai_analyzed_at: new Date().toISOString(), verification_status: "pending", updated_at: new Date().toISOString() }).eq("id", evidence.id);
    if (updateError) throw updateError;
    await loadVerificationQueue();
  } finally {
    setEvidenceAiLoading((p) => { const n = { ...p }; delete n[evidence.id]; return n; });
  }
}

async function loadVerificationQueue() {
  setVerificationConsoleLoading(true); setVerificationConsoleError("");
  try {
    const { data: evidenceData, error: evidenceError } = await supabase.from("supply_chain_evidence").select(`id, product_id, supply_chain_record_id, profile_id, role, evidence_type, file_name, file_path, mime_type, verification_status, created_at, updated_at, ai_recommendation, ai_confidence, ai_risk_level, ai_document_type, ai_findings, ai_analyzed_at, ai_status, products ( id, product_name, product_code, batch_id, category )`).eq("verification_status", "pending").order("created_at", { ascending: false });
    if (evidenceError) throw evidenceError;
    const rows = evidenceData || [];
    const recordIds = [...new Set(rows.map((x) => x.supply_chain_record_id).filter(Boolean))];
    const profileIds = [...new Set(rows.map((x) => x.profile_id).filter(Boolean))];
    let records = [], roleProfilesData = [];
    if (recordIds.length) { const { data, error } = await supabase.from("supply_chain_records").select("id, product_id, contributor_id, role, record_type, record_date, location, facility_name, description, verification_status").in("id", recordIds); if (error) throw error; records = data || []; }
    if (profileIds.length) { const { data, error } = await supabase.from("role_profiles").select("profile_id, role, business_name, business_location, registration_number").in("profile_id", profileIds); if (error) throw error; roleProfilesData = data || []; }
    setVerificationQueue(rows.map((item) => ({ ...item, record: records.find((r) => r.id === item.supply_chain_record_id) || null, roleProfile: roleProfilesData.find((r) => r.profile_id === item.profile_id && r.role === item.role) || roleProfilesData.find((r) => r.profile_id === item.profile_id) || null })));
  } catch (error) { console.error("VERIFICATION QUEUE LOAD ERROR:", error); setVerificationConsoleError(error.message || "Unable to load verification queue."); }
  finally { setVerificationConsoleLoading(false); }
}

const REQUIRED_CERTIFICATE_COUNT = 16;

function getEvidenceVerificationSummary(evidence = []) {
  const requiredEvidence = (evidence || []).filter((item) => {
    const type = String(
      item.evidence_type || item.evidenceType || item.title || ""
    ).toLowerCase();
    return !type.includes("photo");
  });

  const verifiedKeys = new Set();
  const rejectedKeys = new Set();

  requiredEvidence.forEach((item) => {
    const role = String(item.role || item.stage || "").toLowerCase();
    const type = String(
      item.evidence_type || item.evidenceType || item.title || ""
    ).toLowerCase().trim();
    const status = String(
      item.verification_status || item.status || ""
    ).toLowerCase().trim();

    if (!role || !type) return;

    const key = `${role}::${type}`;

    if (status === "verified" || status === "approved") {
      verifiedKeys.add(key);
    }

    if (status === "rejected") {
      rejectedKeys.add(key);
    }
  });

  const verifiedCount = Math.min(
    verifiedKeys.size,
    REQUIRED_CERTIFICATE_COUNT
  );

  const rejectedCount = rejectedKeys.size;

  const confidenceScore = Math.round(
    (verifiedCount / REQUIRED_CERTIFICATE_COUNT) * 100
  );

  let status = "partially_verified";

  if (rejectedCount > 0) {
    status = "flagged";
  } else if (verifiedCount === REQUIRED_CERTIFICATE_COUNT) {
    status = "verified";
  }

  return {
    verifiedCount,
    rejectedCount,
    totalRequired: REQUIRED_CERTIFICATE_COUNT,
    confidenceScore,
    status,
  };
}

async function updateProductVerificationResult(productId) {
  if (!productId) return null;

  const { data: evidenceData, error: evidenceError } = await supabase
    .from("supply_chain_evidence")
    .select("role, evidence_type, verification_status")
    .eq("product_id", productId);

  if (evidenceError) throw evidenceError;

  const summary = getEvidenceVerificationSummary(evidenceData || []);
  const now = new Date().toISOString();

  const { error: verificationError } = await supabase
    .from("verification_results")
    .upsert(
      {
        product_id: productId,
        status: summary.status,
        confidence_score: summary.confidenceScore,
        checked_at: now,
      },
      { onConflict: "product_id" }
    );

  if (verificationError) throw verificationError;

  setVerification((previous) =>
    previous && previous.product_id === productId
      ? {
          ...previous,
          status: summary.status,
          confidence_score: summary.confidenceScore,
          checked_at: now,
        }
      : previous
  );

  setSelectedScan((previous) =>
    previous && (previous.product_id === productId || previous.productId === productId)
      ? {
          ...previous,
          product_id: productId,
          status: summary.status,
          score: summary.confidenceScore,
        }
      : previous
  );

  setRecentScans((previous) =>
    previous.map((scan) =>
      scan.product_id === productId || scan.productId === productId
        ? {
            ...scan,
            product_id: productId,
            status: summary.status,
            score: summary.confidenceScore,
          }
        : scan
    )
  );

  return summary;
}

async function reviewEvidence({ evidenceId, role, roleRecordId, productId, recordType, recordDate, decision }) {
  if (!creatorAuthenticated) throw new Error("Verification Console access is required.");
  if (!currentProfile?.id) throw new Error("Profile not found.");
  if (!["approved", "rejected"].includes(decision)) throw new Error("Invalid review decision.");
  setReviewLoading((p) => ({ ...p, [evidenceId]: true }));
  try {
    const nextStatus = decision === "approved" ? "verified" : "rejected";
    const now = new Date().toISOString();
    const reviewerComment = reviewComments[evidenceId]?.trim() || null;
    const { error: evidenceError } = await supabase.from("supply_chain_evidence").update({ verification_status: nextStatus, updated_at: now }).eq("id", evidenceId);
    if (evidenceError) throw evidenceError;
    const tableByRole = { processor: "processor_records", distributor: "distributor_records", retailer: "retailer_records" };
    if (roleRecordId && tableByRole[role]) { const { error } = await supabase.from(tableByRole[role]).update({ verification_status: nextStatus, updated_at: now }).eq("id", roleRecordId); if (error) throw error; }
    let q = supabase.from("supply_chain_records").update({ verification_status: nextStatus, updated_at: now }).eq("product_id", productId).eq("role", role).eq("record_type", recordType);
    q = recordDate ? q.eq("record_date", recordDate) : q.is("record_date", null);
    const { error: supplyChainError } = await q; if (supplyChainError) throw supplyChainError;
    const { error: reviewError } = await supabase.from("supply_chain_evidence_reviews").insert({ evidence_id: evidenceId, reviewer_id: currentProfile.id, decision, reviewer_comment: reviewerComment, reviewed_at: now });
    if (reviewError) throw reviewError;

    await updateProductVerificationResult(productId);

    setReviewComments((p) => { const n = { ...p }; delete n[evidenceId]; return n; });
    await loadVerificationQueue();
  } finally { setReviewLoading((p) => { const n = { ...p }; delete n[evidenceId]; return n; }); }
}

const openVerificationConsole = () => { setCreatorPin(""); setVerificationConsoleError(""); setScreen("verification-console-login"); };
const authenticateVerificationConsole = () => { const configuredPin = import.meta.env.VITE_SAFAL_CREATOR_PIN || "SAFAL2026"; if (creatorPin === configuredPin) { setCreatorAuthenticated(true); setCreatorPin(""); setVerificationConsoleError(""); setScreen("verification-console"); loadVerificationQueue(); } else setVerificationConsoleError("Incorrect internal access PIN."); };

const handleProducerRecordSave = async () => {
  if (!producerRecordProductId) {
    setProducerError("Please select a product.");
    return;
  }

  if (!currentProfile?.id) {
    setProducerError(
      "Producer profile not found. Please select your producer role again."
    );
    return;
  }

  setProducerLoading(true);
  setProducerError("");

  try {
    // =========================
    // SAVE PRODUCER RECORD
    // =========================

    const {
      data: producerRecord,
      error: producerRecordError,
    } = await supabase
      .from("producer_records")
      .upsert(
        {
          profile_id: currentProfile.id,
          product_id: producerRecordProductId,
          production_date:
            producerProductionDate || null,
          quantity: producerQuantity
            ? Number(producerQuantity)
            : null,
          production_location:
            producerLocation.trim() || null,
          production_details:
            producerDetails.trim() || null,
        },
        {
          onConflict: "product_id",
        }
      )
      .select()
      .single();

    if (producerRecordError) {
      throw producerRecordError;
    }

    // =========================
    // CREATE SUPPLY CHAIN RECORD
    // =========================

    const {
      data: supplyChainRecord,
      error: supplyChainError,
    } = await supabase
      .from("supply_chain_records")
      .insert({
        product_id: producerRecordProductId,
        contributor_id: currentProfile.id,
        role: "producer",
        record_type: "production",
        location:
          producerLocation.trim() || null,
        facility_name:
          currentProfile.name || "Producer",
        record_date:
          producerProductionDate || null,
        description:
          producerDetails.trim() ||
          "Production record added.",
        verification_status: "pending",
      })
      .select("id")
      .single();

    if (supplyChainError) {
      throw supplyChainError;
    }

    // =========================
    // SAVE EVIDENCE
    // =========================

    await saveEvidenceFiles({
      productId: producerRecordProductId,
      supplyChainRecordId: supplyChainRecord.id,
      role: "producer",
      evidenceItems: getEvidenceItems(),
    });

    showSuccessMessage(
      getEvidenceItems().length > 0
        ? "Production record and evidence added successfully."
        : "Production record added successfully."
    );

    resetProducerRecordForm();
    await loadProducerRecords();
    setScreen("producer-records");

  } catch (error) {
    console.error(
      "PRODUCER RECORD SAVE ERROR:",
      error
    );

    setProducerError(
      error.message ||
        "Unable to save production record."
    );
  } finally {
    setProducerLoading(false);
  }
};

  /* =========================
     PRODUCER WORKSPACE
  ========================= */

  if (screen === "producer-workspace") {
    return (
      <main className="app">
        {successMessage && (
          <div className="safal-toast" role="status" aria-live="polite">
            <div className="safal-toast-mark">✓</div>
            <div className="safal-toast-copy">
              <span className="safal-toast-eyebrow">SAVED</span>
              <span className="safal-toast-message">{successMessage}</span>
            </div>
            <button
              type="button"
              className="safal-toast-close"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss notification"
            >
              ×
            </button>
            <span className="safal-toast-line" />
          </div>
        )}

        <section className="profile-screen">

          <header className="page-header">
            <button
              className="back-icon"
              onClick={() => setScreen("home")}
            >
              ←
            </button>

            <span>
              PRODUCER WORKSPACE
            </span>

            <div />
          </header>

          <div className="profile-content">

            <div className="profile-intro">
              <p className="eyebrow">
                SUPPLY CHAIN • PRODUCER
              </p>

              <h1>
                Build the
                <br />
                product record.
              </h1>

              <p className="description">
                Register products and add the
                information that starts their
                traceable journey through SAFAL.
              </p>
            </div>

            <div className="role-list">

              <button
                className="role-card"
                onClick={() => {
                  resetProducerForm();
                  setScreen("producer-add-product");
                }}
              >
                <div className="role-number">
                  01
                </div>

                <div className="role-info">
                  <h2>
                    Add Product
                  </h2>

                  <p>
                    Register a new product and
                    add its production details.
                  </p>
                </div>

                <span className="role-arrow">
                  →
                </span>
              </button>

              <button
                className="role-card"
                onClick={() => {
                  setProducerError("");
                  loadProducerProducts();
                  setScreen("producer-products");
                }}
              >
                <div className="role-number">02</div>
                <div className="role-info">
                  <h2>My Products</h2>
                  <p>View products registered by your business.</p>
                </div>
                <span className="role-arrow">→</span>
              </button>

              <button
                className="role-card"
                onClick={() => {
                  setProducerError("");
                  loadProducerRecords();
                  setScreen("producer-records");
                }}
              >
                <div className="role-number">03</div>
                <div className="role-info">
                  <h2>Production Records</h2>
                  <p>Track production information connected to your products.</p>
                </div>
                <span className="role-arrow">→</span>
              </button>

            </div>

          </div>
        </section>
      </main>
    );
  }

  if (screen === "producer-products") {
    return (
      <main className="app">
        <section className="profile-screen">
          <header className="page-header">
            <button className="back-icon" onClick={() => setScreen("producer-workspace")}>←</button>
            <span>MY PRODUCTS</span><div />
          </header>
          <div className="profile-content">
            <div className="profile-intro">
              <p className="eyebrow">PRODUCER • REGISTERED PRODUCTS</p>
              <h1>Your product<br />records.</h1>
              <p className="description">Products registered by your producer profile in SAFAL.</p>
            </div>
            {producerError && <p className="scan-error">{producerError}</p>}
            <div className="role-list">
              {producerProducts.length === 0 && !producerLoading ? (
                <div className="empty-state"><p>No products registered yet.</p></div>
              ) : producerProducts.map((item, index) => (
                <div key={item.id} className="role-card" style={{ display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div className="role-number">{String(index + 1).padStart(2, "0")}</div>
                    <div className="role-info" style={{ flex: 1 }}>
                      <h2>{item.product_name}</h2>
                      <p>{item.product_code} • Batch: {item.batch_id || "N/A"}</p>
                    </div>
                    <button
                      type="button"
                      className="role-arrow"
                      onClick={() => {
                        setProducerProductCode(item.product_code || "");
                        setScreen("producer-records");
                      }}
                    >
                      →
                    </button>
                  </div>

                  {producerQrCodes[item.id] && (
                    <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,.08)" }}>
                      <strong>PRODUCT QR</strong>
                      <p className="description" style={{ marginTop: "6px" }}>
                        Scan this QR to verify {item.product_name}.
                      </p>

                      <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <img
                          src={producerQrCodes[item.id]}
                          alt={`SAFAL QR for ${item.product_name}`}
                          width="160"
                          height="160"
                          style={{ display: "block", background: "#fff", padding: "8px", border: "1px solid rgba(0,0,0,.10)", borderRadius: "8px" }}
                        />

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <a
                            href={producerQrCodes[item.id]}
                            download={`SAFAL-${item.product_code}-QR.png`}
                            className="scan-secondary"
                            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                          >
                            Download QR
                          </a>

                          <button
                            type="button"
                            className="scan-secondary"
                            onClick={() => {
                              setProducerProductCode(item.product_code || "");
                              setScreen("producer-records");
                            }}
                          >
                            View product record
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "producer-records") {
    return (
      <main className="app">
        <section className="profile-screen">
          <header className="page-header">
            <button className="back-icon" onClick={() => setScreen("producer-workspace")}>←</button>
            <span>PRODUCTION RECORDS</span><div />
          </header>
          <div className="profile-content">
            <div className="profile-intro">
              <p className="eyebrow">PRODUCER • RECORD HISTORY</p>
              <h1>Your production<br />records.</h1>
              <p className="description">Production information, evidence and verification status.</p>
            </div>
            {producerError && <p className="scan-error">{producerError}</p>}
            <button className="profile-continue-button" onClick={() => { resetProducerRecordForm(); loadProducerProducts(); setScreen("producer-add-record"); }}>
              <div><span>PRODUCTION RECORD</span><strong>Add / Upload Evidence</strong></div><span>→</span>
            </button>
            <div className="role-list">
              {producerRecords.length === 0 && !producerLoading ? (
                <div className="empty-state">
                  <p>No production records yet.</p>
                  <p className="description">Create a production record first. You can upload documents or production photos with it.</p>
                </div>
              ) : producerRecords.map((item, index) => (
                <div key={item.id} className="role-card" style={{ display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div className="role-number">{String(index + 1).padStart(2, "0")}</div>
                    <div className="role-info" style={{ flex: 1 }}>
                      <h2>{item.products?.product_name || "Product"}</h2>
                      <p>{item.production_location || "Location not provided"} • {item.production_date || "No date"}</p>
                    </div>
                    <span className="role-arrow">{item.evidence?.length && item.evidence.every((evidence) => evidence.verification_status === "verified") ? "verified" : "pending"}</span>
                  </div>

                  <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,.08)" }}>
                    <strong>EVIDENCE</strong>
                    {item.evidence?.length ? item.evidence.map((evidence) => (
                      <div key={evidence.id} style={{ marginTop: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                          <div>
                            <p style={{ margin: 0 }}><strong>{evidence.evidence_type}</strong></p>
                            <p style={{ margin: "4px 0 0" }}>{evidence.file_name}</p>
                          </div>
                          <span>{evidence.verification_status || "pending"}</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                          <button type="button" onClick={async () => { try { await viewEvidenceFile(evidence.file_path); } catch (error) { setProducerError(error.message || "Unable to open evidence."); } }}>View</button>
                          
                        </div>
                      </div>
                    )) : <p>No evidence uploaded for this record.</p>}

                    {renderHistoryEvidenceUploader({
  item,
  role: "producer",
  recordType: "production",
  recordDate: item.production_date,
  setError: setProducerError,
  onSuccess: loadProducerRecords,
})}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }
  /* =========================
   PRODUCER ADD RECORD
========================= */

if (screen === "producer-add-record") {
  const selected = producerProducts.find(
    (item) => item.id === producerRecordProductId
  );

  return (
    <main className="app">
      <section className="profile-setup-screen">

        <header className="page-header">
          <button
            className="back-icon"
            onClick={() => {
              resetProducerRecordForm();
              setScreen("producer-workspace");
            }}
          >
            ←
          </button>

          <span>
            ADD PRODUCTION RECORD
          </span>

          <div />
        </header>

        <div className="profile-setup-content">

          <div className="profile-setup-intro">
            <p className="eyebrow">
              PRODUCER • PRODUCT PRODUCTION
            </p>

            <h1>
              Add the
              <br />
              production record.
            </h1>

            <p className="description">
              Connect production information
              to an existing SAFAL product.
            </p>
          </div>

          <div className="profile-form">

            <div className="profile-field">
              <label>
                SELECT PRODUCT
              </label>

              <select
                value={producerRecordProductId}
                onChange={(e) =>
                  setProducerRecordProductId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select a product
                </option>

                {producerProducts.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.product_name} —{" "}
                    {item.product_code}
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <div className="profile-field">
                <label>
                  PRODUCT INFORMATION
                </label>

                <p>
                  <strong>Product:</strong>{" "}
                  {selected.product_name}
                </p>

                <p>
                  <strong>Product Code:</strong>{" "}
                  {selected.product_code}
                </p>

                <p>
                  <strong>Batch ID:</strong>{" "}
                  {selected.batch_id ||
                    "Not available"}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {selected.category ||
                    "Not available"}
                </p>
              </div>
            )}

            <div className="profile-field">
              <label>
                PRODUCTION DATE
              </label>

              <input
                type="date"
                value={producerProductionDate}
                onChange={(e) =>
                  setProducerProductionDate(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="profile-field">
              <label>
                QUANTITY
                <span className="optional">
                  OPTIONAL
                </span>
              </label>

              <input
                type="number"
                min="0"
                value={producerQuantity}
                onChange={(e) =>
                  setProducerQuantity(
                    e.target.value
                  )
                }
                placeholder="Enter quantity"
              />
            </div>
            

            <div className="profile-field">
              <label>
                PRODUCTION LOCATION
                <span className="optional">
                  OPTIONAL
                </span>
              </label>

              <input
                type="text"
                value={producerLocation}
                onChange={(e) =>
                  setProducerLocation(
                    e.target.value
                  )
                }
                placeholder="Production facility / location"
              />
            </div>

            <div className="profile-field">
              <label>
                PRODUCTION DETAILS
                <span className="optional">
                  OPTIONAL
                </span>
              </label>

              <textarea
                value={producerDetails}
                onChange={(e) =>
                  setProducerDetails(
                    e.target.value
                  )
                }
                placeholder="Describe the production activity..."
                rows={5}
              />
            </div>
            {renderEvidenceSlots("producer")}


          </div>

          {producerError && (
            <p className="scan-error">
              {producerError}
            </p>
          )}

          <div className="profile-setup-note">
            <span>
              01
            </span>

            <p>
              This record will be linked to
              the selected product and your
              producer profile.
            </p>
          </div>

          <button
            className="profile-continue-button"
            onClick={handleProducerRecordSave}
            disabled={producerLoading}
          >
            <div>
              <span>
                PRODUCTION RECORD
              </span>

              <strong>
                {producerLoading
                  ? "Saving..."
                  : "Save Record"}
              </strong>
            </div>

            <span>
              →
            </span>
          </button>

        </div>
      </section>
    </main>
  );
}

  const loadProcessorRecords = async () => {
    if (!currentProfile?.id) return;
    setProcessorLoading(true);
    setProcessorError("");
    try {
      const { data, error } = await supabase
        .from("processor_records")
        .select(`
          id, product_id, processing_type, processing_date, processing_location,
          quantity_processed, processing_details, verification_status,
          products ( product_name, product_code, batch_id )
        `)
        .eq("profile_id", currentProfile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: evidenceData, error: evidenceError } = await supabase
        .from("supply_chain_evidence")
        .select("id, product_id, supply_chain_record_id, evidence_type, file_name, file_path, mime_type, verification_status, created_at")
        .eq("profile_id", currentProfile.id)
        .eq("role", "processor")
        .order("created_at", { ascending: false });
      if (evidenceError) throw evidenceError;

      setProcessorRecords((data || []).map((record) => ({
        ...record,
        evidence: (evidenceData || []).filter(
          (item) => item.product_id === record.product_id
        ),
      })));
    } catch (error) {
      console.error("PROCESSOR RECORDS LOAD ERROR:", error);
      setProcessorError(error.message || "Unable to load processing records.");
    } finally {
      setProcessorLoading(false);
    }
  };

  const resetDistributorForm = () => {
    setDistributorProductId("");
    setDistributionDate("");
    setDistributionFrom("");
    setDistributionTo("");
    setDistributionQuantity("");
    setDistributionDetails("");
    setEvidenceFiles([]);
    setEvidenceType("Other");
    setEvidenceUploads({});
    setDistributorError("");
  };

  const loadDistributorProducts = async () => {
    setDistributorLoading(true);
    setDistributorError("");
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, product_name, product_code, batch_id, category")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setDistributorProducts(data || []);
    } catch (error) {
      console.error("DISTRIBUTOR PRODUCTS LOAD ERROR:", error);
      setDistributorError(error.message || "Unable to load products.");
    } finally {
      setDistributorLoading(false);
    }
  };

  const loadDistributorRecords = async () => {
    if (!currentProfile?.id) return;
    setDistributorLoading(true);
    setDistributorError("");
    try {
      const { data, error } = await supabase
        .from("distributor_records")
        .select(`
          id, product_id, distribution_date, distribution_from, distribution_to,
          quantity_distributed, distribution_details, verification_status,
          products ( product_name, product_code, batch_id )
        `)
        .eq("profile_id", currentProfile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: evidenceData, error: evidenceError } = await supabase
        .from("supply_chain_evidence")
        .select("id, product_id, supply_chain_record_id, evidence_type, file_name, file_path, mime_type, verification_status, created_at")
        .eq("profile_id", currentProfile.id)
        .eq("role", "distributor")
        .order("created_at", { ascending: false });
      if (evidenceError) throw evidenceError;

      setDistributorRecords((data || []).map((record) => ({
        ...record,
        evidence: (evidenceData || []).filter(
          (item) => item.product_id === record.product_id
        ),
      })));
    } catch (error) {
      console.error("DISTRIBUTOR RECORDS LOAD ERROR:", error);
      setDistributorError(error.message || "Unable to load distribution records.");
    } finally {
      setDistributorLoading(false);
    }
  };

  const handleDistributorRecordSave = async () => {
    if (!distributorProductId || !distributionDate || !distributionFrom.trim() || !distributionTo.trim()) {
      setDistributorError("Please select a product, date, source and destination.");
      return;
    }
    if (!currentProfile?.id) {
      setDistributorError("Distributor profile not found. Please select your distributor role again.");
      return;
    }
    setDistributorLoading(true);
    setDistributorError("");
    try {
      const { error } = await supabase
        .from("distributor_records")
        .insert({
          profile_id: currentProfile.id,
          product_id: distributorProductId,
          distribution_date: distributionDate,
          distribution_from: distributionFrom.trim(),
          distribution_to: distributionTo.trim(),
          quantity_distributed: distributionQuantity
            ? Number(distributionQuantity)
            : null,
          distribution_details:
            distributionDetails.trim() || null,
          verification_status: "pending"
        });

      if (error) throw error;

      const {
        data: supplyChainRecord,
        error: supplyChainError
      } = await supabase
        .from("supply_chain_records")
        .insert({
          product_id: distributorProductId,
          contributor_id: currentProfile.id,
          role: "distributor",
          record_type: "distribution",
          location: distributionTo.trim() || null,
          facility_name: currentProfile.name || "Distributor",
          record_date: distributionDate,
          description:
            distributionDetails.trim() ||
            `Product distributed from ${distributionFrom.trim()} to ${distributionTo.trim()}.`,
          verification_status: "pending"
        })
        .select("id")
        .single();

      if (supplyChainError) {
        throw supplyChainError;
      }

      await saveEvidenceFiles({
        productId: distributorProductId,
        supplyChainRecordId: supplyChainRecord.id,
        role: "distributor",
      evidenceItems: getEvidenceItems(),
      });

      showSuccessMessage(
        getEvidenceItems().length > 0
          ? "Distribution record and evidence added successfully."
          : "Distribution record added successfully."
      );
      resetDistributorForm();
      setScreen("distributor-workspace");
    } catch (error) {
      console.error("DISTRIBUTOR RECORD SAVE ERROR:", error);
      setDistributorError(error.message || "Unable to save distribution record.");
    } finally {
      setDistributorLoading(false);
    }
  };

  const resetRetailerForm = () => {
    setRetailerProductId("");
    setRetailDate("");
    setRetailLocation("");
    setRetailQuantity("");
    setRetailDetails("");
    setEvidenceFiles([]);
    setEvidenceType("Other");
    setEvidenceUploads({});
    setRetailerError("");
  };

  const loadRetailerProducts = async () => {
    setRetailerLoading(true);
    setRetailerError("");
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, product_name, product_code, batch_id, category")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRetailerProducts(data || []);
    } catch (error) {
      console.error("RETAILER PRODUCTS LOAD ERROR:", error);
      setRetailerError(error.message || "Unable to load products.");
    } finally {
      setRetailerLoading(false);
    }
  };

  const loadRetailerRecords = async () => {
    if (!currentProfile?.id) return;
    setRetailerLoading(true);
    setRetailerError("");
    try {
      const { data, error } = await supabase
        .from("retailer_records")
        .select(`
          id, product_id, retail_date, retail_location, quantity_received,
          retail_details, verification_status,
          products ( product_name, product_code, batch_id )
        `)
        .eq("profile_id", currentProfile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: evidenceData, error: evidenceError } = await supabase
        .from("supply_chain_evidence")
        .select("id, product_id, supply_chain_record_id, evidence_type, file_name, file_path, mime_type, verification_status, created_at")
        .eq("profile_id", currentProfile.id)
        .eq("role", "retailer")
        .order("created_at", { ascending: false });
      if (evidenceError) throw evidenceError;

      setRetailerRecords((data || []).map((record) => ({
        ...record,
        evidence: (evidenceData || []).filter(
          (item) => item.product_id === record.product_id
        ),
      })));
    } catch (error) {
      console.error("RETAILER RECORDS LOAD ERROR:", error);
      setRetailerError(error.message || "Unable to load retail records.");
    } finally {
      setRetailerLoading(false);
    }
  };

  const handleRetailerRecordSave = async () => {
    if (!retailerProductId || !retailDate || !retailLocation.trim()) {
      setRetailerError("Please select a product, date and retail location.");
      return;
    }
    if (!currentProfile?.id) {
      setRetailerError("Retailer profile not found. Please select your retailer role again.");
      return;
    }
    setRetailerLoading(true);
    setRetailerError("");
    try {
      const { error } = await supabase
        .from("retailer_records")
        .insert({
          profile_id: currentProfile.id,
          product_id: retailerProductId,
          retail_date: retailDate,
          retail_location: retailLocation.trim(),
          quantity_received: retailQuantity
            ? Number(retailQuantity)
            : null,
          retail_details: retailDetails.trim() || null,
          verification_status: "pending"
        });

      if (error) throw error;

      const {
        data: supplyChainRecord,
        error: supplyChainError
      } = await supabase
        .from("supply_chain_records")
        .insert({
          product_id: retailerProductId,
          contributor_id: currentProfile.id,
          role: "retailer",
          record_type: "retail",
          location: retailLocation.trim(),
          facility_name: currentProfile.name || "Retailer",
          record_date: retailDate,
          description:
            retailDetails.trim() ||
            "Product received and available for retail.",
          verification_status: "pending"
        })
        .select("id")
        .single();

      if (supplyChainError) {
        throw supplyChainError;
      }

      await saveEvidenceFiles({
        productId: retailerProductId,
        supplyChainRecordId: supplyChainRecord.id,
        role: "retailer",
      evidenceItems: getEvidenceItems(),
      });

      showSuccessMessage(
        getEvidenceItems().length > 0
          ? "Retail record and evidence added successfully."
          : "Retail record added successfully."
      );
      resetRetailerForm();
      setScreen("retailer-workspace");
    } catch (error) {
      console.error("RETAILER RECORD SAVE ERROR:", error);
      setRetailerError(error.message || "Unable to save retail record.");
    } finally {
      setRetailerLoading(false);
    }
  };

  /* =========================
     PROCESSOR WORKSPACE
  ========================= */

  if (screen === "processor-workspace") {
    return (
      <main className="app">
        {successMessage && (
          <div className="safal-toast" role="status" aria-live="polite">
            <div className="safal-toast-mark">✓</div>
            <div className="safal-toast-copy">
              <span className="safal-toast-eyebrow">SAVED</span>
              <span className="safal-toast-message">{successMessage}</span>
            </div>
            <button
              type="button"
              className="safal-toast-close"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss notification"
            >
              ×
            </button>
            <span className="safal-toast-line" />
          </div>
        )}

        <section className="profile-screen">
          <header className="page-header">
            <button className="back-icon" onClick={() => setScreen("home")}>←</button>
            <span>PROCESSOR WORKSPACE</span>
            <div />
          </header>

          <div className="profile-content">
            <div className="profile-intro">
              <p className="eyebrow">SUPPLY CHAIN • PROCESSOR</p>
              <h1>Transform the<br />product.</h1>
              <p className="description">Record processing activities and connect them to registered SAFAL products.</p>
            </div>

            <div className="role-list">
              <button className="role-card" onClick={() => { resetProcessorForm(); loadProcessorProducts(); setScreen("processor-add-record"); }}>
                <div className="role-number">01</div>
                <div className="role-info">
                  <h2>Add Processing Record</h2>
                  <p>Select a product and record the processing activity.</p>
                </div>
                <span className="role-arrow">→</span>
              </button>

              <button className="role-card" onClick={() => { setProcessorError(""); loadProcessorProducts(); setScreen("processor-products"); }}>
                <div className="role-number">02</div>
                <div className="role-info">
                  <h2>Products to Process</h2>
                  <p>View products registered by producers.</p>
                </div>
                <span className="role-arrow">→</span>
              </button>

              <button className="role-card" onClick={() => { setProcessorError(""); loadProcessorRecords(); setScreen("processor-records"); }}>
                <div className="role-number">03</div>
                <div className="role-info">
                  <h2>Processing Records</h2>
                  <p>Track processing activities connected to your profile.</p>
                </div>
                <span className="role-arrow">→</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "processor-products") {
    return (
      <main className="app">
        <section className="profile-screen">
          <header className="page-header">
            <button className="back-icon" onClick={() => setScreen("processor-workspace")}>←</button>
            <span>PRODUCTS TO PROCESS</span><div />
          </header>
          <div className="profile-content">
            <div className="profile-intro">
              <p className="eyebrow">PROCESSOR • AVAILABLE PRODUCTS</p>
              <h1>Products ready<br />for processing.</h1>
              <p className="description">Products currently registered in SAFAL.</p>
            </div>
            {processorError && <p className="scan-error">{processorError}</p>}
            <div className="role-list">
              {processorProducts.length === 0 && !processorLoading ? (
                <div className="empty-state"><p>No products available yet.</p></div>
              ) : processorProducts.map((item, index) => (
                <button key={item.id} className="role-card" onClick={() => { setProcessorProductId(item.id); setScreen("processor-add-record"); }}>
                  <div className="role-number">{String(index + 1).padStart(2, "0")}</div>
                  <div className="role-info"><h2>{item.product_name}</h2><p>{item.product_code} • Batch: {item.batch_id || "N/A"}</p></div>
                  <span className="role-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "processor-records") {
    return (
      <main className="app"><section className="profile-screen">
        <header className="page-header"><button className="back-icon" onClick={() => setScreen("processor-workspace")}>←</button><span>PROCESSING RECORDS</span><div /></header>
        <div className="profile-content">
          <div className="profile-intro"><p className="eyebrow">PROCESSOR • RECORD HISTORY</p><h1>Your processing<br />records.</h1><p className="description">Processing records, evidence and verification status.</p></div>
          {processorError && <p className="scan-error">{processorError}</p>}
          <button className="profile-continue-button" onClick={() => { resetProcessorForm(); loadProcessorProducts(); setScreen("processor-add-record"); }}><div><span>PROCESSING RECORD</span><strong>Add / Upload Evidence</strong></div><span>→</span></button>
          <div className="role-list">
            {processorRecords.length === 0 && !processorLoading ? <div className="empty-state"><p>No processing records yet.</p><p className="description">Create a processing record first. You can upload supporting evidence with it.</p></div> : processorRecords.map((item,index)=><div key={item.id} className="role-card" style={{display:"block"}}>
              <div style={{display:"flex",alignItems:"center",gap:"14px"}}><div className="role-number">{String(index+1).padStart(2,"0")}</div><div className="role-info" style={{flex:1}}><h2>{item.products?.product_name||"Product"}</h2><p>{item.processing_type} • {item.processing_date||"No date"}</p></div><span className="role-arrow">{item.verification_status||"pending"}</span></div>
              <div style={{marginTop:"18px",paddingTop:"16px",borderTop:"1px solid rgba(0,0,0,.08)"}}><strong>EVIDENCE</strong>
                {item.evidence?.length ? item.evidence.map(evidence=><div key={evidence.id} style={{marginTop:"10px"}}><div style={{display:"flex",justifyContent:"space-between",gap:"10px",alignItems:"center"}}><div><p style={{margin:0}}><strong>{evidence.evidence_type}</strong></p><p style={{margin:"4px 0 0"}}>{evidence.file_name}</p></div><span>{evidence.verification_status||"pending"}</span></div><div style={{display:"flex",gap:"8px",marginTop:"8px",flexWrap:"wrap"}}><button type="button" onClick={async()=>{try{await viewEvidenceFile(evidence.file_path);}catch(error){setProcessorError(error.message||"Unable to open evidence.");}}}>View</button></div></div>):<p>No evidence uploaded for this record.</p>}
                {renderHistoryEvidenceUploader({
  item,
  role: "processor",
  recordType: "processing",
  recordDate: item.processing_date,
  setError: setProcessorError,
  onSuccess: loadProcessorRecords,
})}
              </div>
            </div>)}
          </div>
        </div>
      </section></main>
    );
  }
  /* =========================
     PROCESSOR ADD RECORD
  ========================= */

  if (screen === "processor-add-record") {
    return (
      <main className="app">
        <section className="profile-setup-screen">

          <header className="page-header">
            <button
              className="back-icon"
              onClick={() => {
                resetProcessorForm();
                setScreen("processor-workspace");
              }}
            >
              ←
            </button>

            <span>
              ADD PROCESSING RECORD
            </span>

            <div />
          </header>

          <div className="profile-setup-content">

            <div className="profile-setup-intro">
              <p className="eyebrow">
                PROCESSOR • PRODUCT PROCESSING
              </p>

              <h1>
                Add the
                <br />
                processing record.
              </h1>

              <p className="description">
                Connect your processing activity
                to an existing SAFAL product.
              </p>
            </div>

            <div className="profile-form">

              <div className="profile-field">
                <label>
                  SELECT PRODUCT
                </label>

                <select
                  value={processorProductId}
                  onChange={(e) =>
                    setProcessorProductId(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select a product
                  </option>

                  {processorProducts.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.product_name} —{" "}
                        {item.product_code}
                      </option>
                    )
                  )}
                </select>
              </div>

              {processorProductId && (
                <div className="profile-field">
                  {(() => {
                    const selected =
                      processorProducts.find(
                        (item) =>
                          item.id ===
                          processorProductId
                      );

                    if (!selected) return null;

                    return (
                      <>
                        <label>
                          PRODUCT INFORMATION
                        </label>

                        <p>
                          <strong>
                            Product:
                          </strong>{" "}
                          {selected.product_name}
                        </p>

                        <p>
                          <strong>
                            Product Code:
                          </strong>{" "}
                          {selected.product_code}
                        </p>

                        <p>
                          <strong>
                            Batch ID:
                          </strong>{" "}
                          {selected.batch_id ||
                            "Not available"}
                        </p>

                        <p>
                          <strong>
                            Category:
                          </strong>{" "}
                          {selected.category ||
                            "Not available"}
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="profile-field">
                <label>
                  PROCESSING TYPE
                </label>

                <input
                  type="text"
                  value={processingType}
                  onChange={(e) =>
                    setProcessingType(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Cleaning, Packaging, Refining"
                />
              </div>

              <div className="profile-field">
                <label>
                  PROCESSING DATE
                </label>

                <input
                  type="date"
                  value={processingDate}
                  onChange={(e) =>
                    setProcessingDate(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="profile-field">
                <label>
                  PROCESSING LOCATION
                  <span className="optional">
                    OPTIONAL
                  </span>
                </label>

                <input
                  type="text"
                  value={processingLocation}
                  onChange={(e) =>
                    setProcessingLocation(
                      e.target.value
                    )
                  }
                  placeholder="Processing facility / location"
                />
              </div>

              <div className="profile-field">
                <label>
                  QUANTITY PROCESSED
                  <span className="optional">
                    OPTIONAL
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  value={quantityProcessed}
                  onChange={(e) =>
                    setQuantityProcessed(
                      e.target.value
                    )
                  }
                  placeholder="Enter quantity"
                />
              </div>

              <div className="profile-field">
                <label>
                  PROCESSING DETAILS
                  <span className="optional">
                    OPTIONAL
                  </span>
                </label>

                <textarea
                  value={processingDetails}
                  onChange={(e) =>
                    setProcessingDetails(
                      e.target.value
                    )
                  }
                  placeholder="Describe the processing activity..."
                  rows={5}
                />
              </div>

              {renderEvidenceSlots("processor")}


            </div>

            {processorError && (
              <p className="scan-error">
                {processorError}
              </p>
            )}

            <div className="profile-setup-note">
              <span>
                01
              </span>

              <p>
                This record will be linked to
                the selected product and your
                processor profile.
              </p>
            </div>

            <button
              className="profile-continue-button"
              onClick={
                handleProcessorRecordSave
              }
              disabled={processorLoading}
            >
              <div>
                <span>
                  PROCESSING RECORD
                </span>

                <strong>
                  {processorLoading
                    ? "Saving..."
                    : "Save Record"}
                </strong>
              </div>

              <span>
                →
              </span>
            </button>

          </div>
        </section>
      </main>
    );
  }

  /* =========================
     PRODUCER ADD PRODUCT
  ========================= */

  if (screen === "producer-add-product") {

    const handleProducerProductContinue = async () => {
  if (
    !producerProductName.trim() ||
    !producerProductCode.trim() ||
    !producerBatchId.trim() ||
    !producerCategory.trim()
  ) {
    setProducerError(
      "Please complete the product name, product code, batch ID and category."
    );
    return;
  }

  if (!currentProfile?.id) {
    setProducerError(
      "Producer profile not found. Please select your producer role again."
    );
    return;
  }

  setProducerLoading(true);
  setProducerError("");

  try {
    /* =========================
       CHECK DUPLICATE PRODUCT CODE
    ========================= */

    const {
      data: existingProduct,
      error: duplicateCheckError,
    } = await supabase
      .from("products")
      .select("id, product_name")
      .eq(
        "product_code",
        producerProductCode.trim()
      )
      .maybeSingle();

    if (duplicateCheckError) {
      throw duplicateCheckError;
    }

    if (existingProduct) {
      setProducerError(
        "A product with this product code already exists."
      );
      return;
    }

    /* =========================
       CREATE PRODUCT
    ========================= */

    const {
      data: newProduct,
      error: productError,
    } = await supabase
      .from("products")
      .insert({
        product_name:
          producerProductName.trim(),

        product_code:
          producerProductCode.trim().toUpperCase(),

        batch_id:
          producerBatchId.trim(),

        category:
          producerCategory.trim(),

        producer_id:
          currentProfile.id,
      })
      .select()
      .single();

    if (productError) {
      throw productError;
    }

    /* =========================
       CREATE INITIAL VERIFICATION RECORD
    ========================= */

    const { error: verificationInsertError } = await supabase
      .from("verification_results")
      .insert({
        product_id: newProduct.id,
        status: "partially_verified",
        confidence_score: 0,
        checked_at: new Date().toISOString(),
      });

    if (verificationInsertError) {
      throw verificationInsertError;
    }

    /* =========================
       SAVE PRODUCTION RECORD
    ========================= */

    const {
      error: productionError,
    } = await supabase
      .from("producer_records")
      .insert({
        profile_id: currentProfile.id,

        product_id: newProduct.id,

        production_date:
          producerProductionDate || null,

        quantity:
          producerQuantity
            ? Number(producerQuantity)
            : null,

        production_location:
          producerLocation.trim() || null,

        production_details:
          producerDetails.trim() || null,
      });
    if (productionError) {
  throw productionError;
}

const {
  data: supplyChainRecord,
  error: supplyChainError,
} = await supabase
  .from("supply_chain_records")
  .insert({
    product_id: newProduct.id,
    contributor_id: currentProfile.id,
    role: "producer",
    record_type: "production",
    location: producerLocation.trim() || null,
    facility_name: currentProfile.name || "Producer",
    record_date: producerProductionDate || null,
    description:
      producerDetails.trim() ||
      "Production record added.",
    verification_status: "pending",
  })
  .select("id")
  .single();

if (supplyChainError) {
  throw supplyChainError;
}

await saveEvidenceFiles({
  productId: newProduct.id,
  supplyChainRecordId: supplyChainRecord.id,
  role: "producer",
  evidenceItems: getEvidenceItems(),
});



    /* =========================
       SUCCESS
    ========================= */

    setProducerError("");

    showSuccessMessage(
      "Product registered successfully."
    );

    resetProducerForm();

    setScreen("producer-workspace");

  } catch (error) {
    console.error(
      "PRODUCER PRODUCT SAVE ERROR:",
      error
    );

    setProducerError(
      error.message ||
      "Unable to register the product. Please try again."
    );
  } finally {
    setProducerLoading(false);
  }
};

    return (
      <main className="app">
        <section className="profile-setup-screen">

          <header className="page-header">
            <button
              className="back-icon"
              onClick={() => {
                resetProducerForm();
                setScreen("producer-workspace");
              }}
            >
              ←
            </button>

            <span>
              ADD PRODUCT
            </span>

            <div />
          </header>

          <div className="profile-setup-content">

            <div className="profile-setup-intro">
              <p className="eyebrow">
                PRODUCER • PRODUCT REGISTRATION
              </p>

              <h1>
                Create the
                <br />
                product record.
              </h1>

              <p className="description">
                Start with the product identity
                and production information that
                will become part of its SAFAL
                provenance record.
              </p>
            </div>

            <div className="profile-form">

              <div className="profile-field">
                <label>
                  PRODUCT NAME
                </label>

                <input
                  type="text"
                  value={producerProductName}
                  onChange={(e) =>
                    setProducerProductName(e.target.value)
                  }
                  placeholder="Enter product name"
                />
              </div>

              <div className="profile-field">
                <label>
                  PRODUCT CODE
                </label>

                <input
                  type="text"
                  value={producerProductCode}
                  onChange={(e) =>
                    setProducerProductCode(
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="e.g. SAFAL-COCO-004"
                />
              </div>

              <div className="profile-field">
                <label>
                  BATCH ID
                </label>

                <input
                  type="text"
                  value={producerBatchId}
                  onChange={(e) =>
                    setProducerBatchId(e.target.value)
                  }
                  placeholder="Enter batch ID"
                />
              </div>

              <div className="profile-field">
                <label>
                  CATEGORY
                </label>

                <input
                  type="text"
                  value={producerCategory}
                  onChange={(e) =>
                    setProducerCategory(e.target.value)
                  }
                  placeholder="e.g. Food, Textile, Electronics"
                />
              </div>

              <div className="profile-field">
                <label>
                  PRODUCTION DATE
                  <span className="optional">
                    OPTIONAL
                  </span>
                </label>

                <input
                  type="date"
                  value={producerProductionDate}
                  onChange={(e) =>
                    setProducerProductionDate(e.target.value)
                  }
                />
              </div>

              <div className="profile-field">
                <label>
                  QUANTITY
                  <span className="optional">
                    OPTIONAL
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  value={producerQuantity}
                  onChange={(e) =>
                    setProducerQuantity(e.target.value)
                  }
                  placeholder="Enter quantity"
                />
              </div>

              <div className="profile-field">
                <label>
                  PRODUCTION LOCATION
                  <span className="optional">
                    OPTIONAL
                  </span>
                </label>

                <input
                  type="text"
                  value={producerLocation}
                  onChange={(e) =>
                    setProducerLocation(e.target.value)
                  }
                  placeholder="City, State / Country"
                />
              </div>

              <div className="profile-field">
                <label>
                  PRODUCTION DETAILS
                  <span className="optional">
                    OPTIONAL
                  </span>
                </label>

                <textarea
                  value={producerDetails}
                  onChange={(e) =>
                    setProducerDetails(e.target.value)
                  }
                  placeholder="Describe the production process, materials, or other relevant information."
                  rows={5}
                />
              </div>

              {renderEvidenceSlots("producer")}


            </div>

            {producerError && (
              <p className="scan-error">
                {producerError}
              </p>
            )}

            <div className="profile-setup-note">
              <span>
                01
              </span>

              <p>
                Product registration will be
                connected to your existing SAFAL
                database after the products table
                structure is confirmed.
              </p>
            </div>

            <button
              className="profile-continue-button"
              onClick={handleProducerProductContinue}
              disabled={producerLoading}
            >
              <div>
                <span>
                  PRODUCT REGISTRATION
                </span>

                <strong>
                  Save Product
                </strong>
              </div>

              <span>
                →
              </span>
            </button>

          </div>
        </section>
      </main>
    );
  
  }
  /* =========================
     EVIDENCE EXPLORER
  ========================= */

  if (screen === "evidence") {
    const evidence =
      selectedScan?.evidence || [];

    const backScreen =
      selectedScan?.status === "verified"
        ? "result"
        : selectedScan?.status ===
          "partially_verified"
        ? "partial"
        : selectedScan?.status ===
          "flagged"
        ? "flagged"
        : "home";

    const verifiedCount = evidence.filter(
      (item) =>
        item.status === "verified"
    ).length;

    const attentionCount = evidence.filter(
      (item) =>
        item.status === "flagged" ||
        item.status === "rejected"
    ).length;

    return (
      <main className="app">
        <section className="evidence-screen">
          <header className="evidence-header">
            <button
              className="evidence-back"
              onClick={() =>
                setScreen(backScreen)
              }
            >
              ← Back
            </button>

            <span>
              EVIDENCE EXPLORER
            </span>

            <div className="evidence-header-count">
              {String(
                evidence.length
              ).padStart(2, "0")}{" "}
              RECORDS
            </div>
          </header>

          <div className="evidence-content">
            <section className="evidence-intro">
              <p className="eyebrow">
                PRODUCT VERIFICATION
              </p>

              <h1>
                Explore the
                <br />
                evidence.
              </h1>

              <p className="description">
                Review the connected records
                used to build this product's
                verification result.
              </p>
            </section>

            <section className="evidence-product-summary">
              <div className="evidence-product-main">
                {selectedScan?.image ? (
                  <img
                    src={
                      selectedScan.image
                    }
                    alt={
                      selectedScan.name
                    }
                    className="evidence-product-image"
                  />
                ) : (
                  <div className="evidence-product-placeholder">
                    {selectedScan?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "P"}
                  </div>
                )}

                <div>
                  <span className="evidence-label">
                    PRODUCT
                  </span>

                  <h2>
                    {selectedScan?.name ||
                      "Product"}
                  </h2>

                  <p>
                    {selectedScan?.code}
                  </p>
                </div>
              </div>

              <div className="evidence-product-meta">
                <div>
                  <span>BATCH</span>

                  <strong>
                    {selectedScan?.batchId ||
                      "Not available"}
                  </strong>
                </div>

                <div>
                  <span>CONFIDENCE</span>

                  <strong>
                    {selectedScan?.score ??
                      0}
                    %
                  </strong>
                </div>

                <div>
                  <span>STATUS</span>

                  <strong>
                    {selectedScan?.status
                      ?.replaceAll(
                        "_",
                        " "
                      )
                      .toUpperCase() ||
                      "UNKNOWN"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="evidence-overview">
              <div className="evidence-overview-item">
                <span>
                  CONNECTED RECORDS
                </span>

                <strong>
                  {String(
                    evidence.length
                  ).padStart(2, "0")}
                </strong>
              </div>

              <div className="evidence-overview-item">
                <span>VERIFIED</span>

                <strong>
                  {String(
                    verifiedCount
                  ).padStart(2, "0")}
                </strong>
              </div>

              <div className="evidence-overview-item">
                <span>
                  REQUIRES REVIEW
                </span>

                <strong>
                  {String(
                    attentionCount
                  ).padStart(2, "0")}
                </strong>
              </div>
            </section>

            <section className="evidence-records-section">
              <div className="evidence-section-heading">
                <div>
                  <p className="eyebrow">
                    VERIFICATION SOURCES
                  </p>

                  <h2>
                    Connected records
                  </h2>
                </div>

                <span>
                  {evidence.length} TOTAL
                </span>
              </div>

              {evidence.length === 0 ? (
                <div className="evidence-empty">
                  <span>
                    NO RECORDS
                  </span>

                  <h3>
                    No supporting evidence
                    found.
                  </h3>

                  <p>
                    This product currently has
                    no connected supply-chain
                    records.
                  </p>
                </div>
              ) : (
                <div className="evidence-list">
                  {evidence.map(
                    (item, index) => (
                      <article
                        className={`evidence-card evidence-${item.status}`}
                        key={`${item.title}-${index}`}
                      >
                        <div className="evidence-number">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </div>

                        <div className="evidence-info">
                          <span className="evidence-stage">
                            {item.stage}
                          </span>

                          <h3>
                            {item.title}
                          </h3>

                          <p className="evidence-detail">
                            {item.detail}
                          </p>

                          {item.description && (
                            <p className="evidence-location">
                              {
                                item.description
                              }
                            </p>
                          )}
                        </div>

                        <div className="evidence-record-status">
                          <span
                            className={`status-dot ${item.status}`}
                          />

                          <span>
                            {item.status
                              ?.replaceAll(
                                "_",
                                " "
                              )
                              .toUpperCase()}
                          </span>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>

            <section className="evidence-summary">
              <p className="eyebrow">
                EVIDENCE SUMMARY
              </p>

              <h2>
                The verification result is
                built from the records shown
                above.
              </h2>

              <p>
                Each connected record
                contributes to the overall
                confidence and verification
                status of this product.
              </p>
            </section>

            <button
              className="evidence-next-button"
              onClick={() =>
                setScreen("passport")
              }
            >
              <div>
                <span>
                  NEXT EXPERIENCE
                </span>

                <strong>
                  View digital product
                  passport
                </strong>
              </div>

              <span className="evidence-next-arrow">
                →
              </span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
     DIGITAL PASSPORT
  ========================= */

  if (screen === "passport") {
    const passportStatus =
      selectedScan?.status ||
      verification?.status ||
      "verified";

    const passportScore =
      (selectedScan?.evidence?.length
      ? getEvidenceVerificationSummary(selectedScan.evidence).confidenceScore
      : selectedScan?.score ?? verification?.confidence_score ?? 0);

    return (
      <main className="app">
        <section className="passport-screen">
          <header className="page-header">
            <button
              className="back-icon"
              onClick={() =>
                setScreen("evidence")
              }
            >
              ←
            </button>

            <span>
              DIGITAL PASSPORT
            </span>

            <div />
          </header>

          <div className="passport-content">
            <div className="passport-intro">
              <p className="eyebrow">
                PRODUCT IDENTITY
              </p>

              <h1>
                The product,
                <br />
                documented.
              </h1>

              <p className="description">
                A digital record containing
                the product's identity,
                origin, verification status
                and supply-chain information.
              </p>
            </div>

            <div className="passport-card">
              <div className="passport-top">
                <div className="passport-product-image">
                  {selectedScan?.image ? (
                    <img
                      src={
                        selectedScan.image
                      }
                      alt={
                        selectedScan.name
                      }
                    />
                  ) : (
                    <div className="passport-image-placeholder">
                      {selectedScan?.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "P"}
                    </div>
                  )}
                </div>

                <div className="passport-product-info">
                  <span>
                    PRODUCT PASSPORT
                  </span>

                  <h2>
                    {selectedScan?.name ||
                      "Product"}
                  </h2>

                  <p>
                    {selectedScan?.category ||
                      product?.category ||
                      "Product"}
                  </p>
                </div>
              </div>

              <div className="passport-divider" />

              <div className="passport-grid">
                <div className="passport-field">
                  <span>
                    PRODUCT CODE
                  </span>

                  <strong>
                    {selectedScan?.code ||
                      product?.product_code ||
                      "Not available"}
                  </strong>
                </div>

                <div className="passport-field">
                  <span>BATCH ID</span>

                  <strong>
                    {selectedScan?.batchId ||
                      product?.batch_id ||
                      "Not available"}
                  </strong>
                </div>

                <div className="passport-field">
                  <span>
                    VERIFICATION
                  </span>

                  <strong
                    className={`passport-status ${passportStatus}`}
                  >
                    {passportStatus
                      .replaceAll(
                        "_",
                        " "
                      )
                      .toUpperCase()}
                  </strong>
                </div>

                <div className="passport-field">
                  <span>
                    CONFIDENCE
                  </span>

                  <strong>
                    {passportScore}%
                  </strong>
                </div>
              </div>
            </div>

            <div className="passport-section">
              <p className="eyebrow">
                RECORD SUMMARY
              </p>

              <div className="passport-summary-card">
                <div className="passport-summary-row">
                  <span>
                    Product identity
                  </span>

                  <strong>
                    Confirmed
                  </strong>
                </div>

                <div className="passport-summary-row">
                  <span>
                    Supply-chain records
                  </span>

                  <strong>
                    {selectedScan?.evidence
                      ?.length || 0}{" "}
                    records
                  </strong>
                </div>

                <div className="passport-summary-row">
                  <span>
                    Verification status
                  </span>

                  <strong>
                    {passportStatus.replaceAll(
                      "_",
                      " "
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="passport-note">
              <span className="passport-note-number">
                01
              </span>

              <p>
                This passport brings
                together the available
                product and supply-chain
                records into one traceable
                product identity.
              </p>
            </div>

            <div className="result-actions">
              <button
                className="result-primary"
                onClick={() =>
                  setScreen("evidence")
                }
              >
                Explore supporting evidence
                <span>→</span>
              </button>

              <button
                className="result-secondary"
                onClick={() =>
                  setScreen("decision")
                }
              >
                Continue to decision
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
     PURCHASE DECISION
  ========================= */

  if (screen === "decision") {
    const score =
      (selectedScan?.evidence?.length
      ? getEvidenceVerificationSummary(selectedScan.evidence).confidenceScore
      : selectedScan?.score ?? verification?.confidence_score ?? 0);

    const decisionStatus =
      selectedScan?.status ===
      "verified"
        ? "FULLY VERIFIED"
        : selectedScan?.status ===
          "partially_verified"
        ? "PARTIALLY VERIFIED"
        : selectedScan?.status ===
          "flagged"
        ? "REQUIRES ATTENTION"
        : "VERIFICATION COMPLETE";

    const decisionMessage =
      selectedScan?.status ===
      "verified"
        ? "The product and available supply-chain records have been successfully verified."
        : selectedScan?.status ===
          "partially_verified"
        ? "The available product records have been reviewed. Some parts of the product journey could not be fully verified."
        : selectedScan?.status ===
          "flagged"
        ? "One or more product records require further review before making a purchase decision."
        : "The available product records have been reviewed.";

    const recommendation =
      selectedScan?.status ===
      "verified"
        ? "This product has a strong verification record."
        : selectedScan?.status ===
          "partially_verified"
        ? "Proceed with awareness of the missing or incomplete records."
        : selectedScan?.status ===
          "flagged"
        ? "We recommend reviewing the flagged records before proceeding."
        : "Review the available information before making your decision.";

    return (
      <main className="app">
        <section className="decision-screen">
          <header className="page-header decision-header">
            <button
              className="back-icon"
              onClick={() =>
                setScreen("evidence")
              }
            >
              ←
            </button>

            <span>
              PURCHASE DECISION
            </span>

            <div />
          </header>

          <div className="decision-content">
            <div className="decision-main">
              <p className="eyebrow">
                {decisionStatus}
              </p>

              <h1>
                Make your
                <br />
                decision.
              </h1>

              <p className="decision-description">
                {decisionMessage}
              </p>

              <div className="decision-score">
                <div className="decision-score-top">
                  <span>
                    CONFIDENCE SCORE
                  </span>

                  <strong>
                    {score}
                    <small>%</small>
                  </strong>
                </div>

                <div className="decision-score-track">
                  <div
                    className="decision-score-fill"
                    style={{
                      width: `${score}%`,
                    }}
                  />
                </div>

                <p>
                  {recommendation}
                </p>
              </div>

              <div className="decision-actions">
                <button
                  className="decision-primary"
                  onClick={() =>
                    selectedScan?.status ===
                    "flagged"
                      ? setScreen(
                          "evidence"
                        )
                      : setScreen(
                          "purchase"
                        )
                  }
                >
                  {selectedScan?.status ===
                  "flagged"
                    ? "Review flagged records →"
                    : "Proceed with purchase →"}
                </button>

                <button
                  className="decision-secondary"
                  onClick={() =>
                    setScreen("home")
                  }
                >
                  Return home
                </button>
              </div>
            </div>

            <div className="decision-side">
              <div className="decision-product-card">
                <span className="decision-card-label">
                  PRODUCT REVIEW
                </span>

                <h2>
                  {selectedScan?.name ||
                    "Product"}
                </h2>

                <div className="decision-product-info">
                  <div>
                    <span>
                      PRODUCT CODE
                    </span>

                    <strong>
                      {selectedScan?.code ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>BATCH</span>

                    <strong>
                      {selectedScan?.batchId ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>STATUS</span>

                    <strong className="decision-status-value">
                      {selectedScan?.status
                        ?.replaceAll(
                          "_",
                          " "
                        )
                        .toUpperCase() ||
                        "UNKNOWN"}
                    </strong>
                  </div>
                </div>

                <button
                  className="decision-records-button"
                  onClick={() =>
                    setScreen("evidence")
                  }
                >
                  View product journey
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
     PURCHASE
  ========================= */

  if (screen === "purchase") {
    const purchaseEvidenceSummary =
      getEvidenceVerificationSummary(selectedScan?.evidence || []);

    const score =
      purchaseEvidenceSummary.confidenceScore > 0 ||
      (selectedScan?.evidence || []).length > 0
        ? purchaseEvidenceSummary.confidenceScore
        : selectedScan?.score ??
          verification?.confidence_score ??
          0;

    const selectedProductName =
      selectedScan?.name || "Product";

    const selectedProductCode =
      selectedScan?.code ||
      "Not available";

    const batchId =
      selectedScan?.batchId ||
      "Not available";

    const status =
      selectedScan?.status ||
      "unknown";

    const statusLabel =
      status === "verified"
        ? "VERIFIED PRODUCT"
        : status ===
          "partially_verified"
        ? "PARTIALLY VERIFIED"
        : "PRODUCT REVIEWED";

    return (
      <main className="app">
        <section className="purchase-screen">
          <header className="page-header purchase-header">
            <button
              className="back-icon"
              onClick={() =>
                setScreen("decision")
              }
            >
              ←
            </button>

            <span>
              PURCHASE CONFIRMATION
            </span>

            <div />
          </header>

          <div className="purchase-content">
            <div className="purchase-main">
              <p className="eyebrow">
                {statusLabel}
              </p>

              <h1>
                You’re ready to
                <br />
                proceed.
              </h1>

              <p className="purchase-description">
                The available product
                information and supply-chain
                records have been reviewed
                to support your purchase
                decision.
              </p>

              <div className="purchase-product-card">
                <div className="purchase-product-top">
                  <span>PRODUCT</span>

                  <strong>
                    {selectedProductName}
                  </strong>
                </div>

                <div className="purchase-product-details">
                  <div>
                    <span>
                      PRODUCT CODE
                    </span>

                    <strong>
                      {selectedProductCode}
                    </strong>
                  </div>

                  <div>
                    <span>BATCH</span>

                    <strong>
                      {batchId}
                    </strong>
                  </div>

                  <div>
                    <span>
                      VERIFICATION
                    </span>

                    <strong>
                      {status
                        .replaceAll(
                          "_",
                          " "
                        )
                        .toUpperCase()}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="purchase-confidence">
                <span>
                  VERIFICATION CONFIDENCE
                </span>

                <strong>
                  {score}
                  <small>%</small>
                </strong>

                <div className="purchase-score-track">
                  <div
                    className="purchase-score-fill"
                    style={{
                      width: `${score}%`,
                    }}
                  />
                </div>
              </div>

              <div className="purchase-note">
                <span>01</span>

                <p>
                  SAFAL does not sell this
                  product. This verification
                  helps you make a more
                  informed purchase decision
                  based on the available
                  records and evidence.
                </p>
              </div>

              <div className="purchase-actions">
                <button
                  className="purchase-primary"
                  onClick={() =>
                    setScreen(
                      "purchase-complete"
                    )
                  }
                >
                  I understand. Proceed →
                </button>

                <button
                  className="purchase-secondary"
                  onClick={() =>
                    setScreen("decision")
                  }
                >
                  Review decision
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
     PURCHASE COMPLETE
  ========================= */

  if (
    screen === "purchase-complete"
  ) {
    const completeEvidenceSummary =
      getEvidenceVerificationSummary(selectedScan?.evidence || []);

    const score =
      completeEvidenceSummary.confidenceScore > 0 ||
      (selectedScan?.evidence || []).length > 0
        ? completeEvidenceSummary.confidenceScore
        : selectedScan?.score ??
          verification?.confidence_score ??
          0;

    return (
      <main className="app">
        <section className="purchase-complete-screen">
          <header className="page-header purchase-header">
            <button
              className="back-icon"
              onClick={() =>
                setScreen("purchase")
              }
            >
              ←
            </button>

            <span>
              PURCHASE DECISION
            </span>

            <div />
          </header>

          <div className="purchase-complete-content">
            <p className="eyebrow">
              DECISION RECORDED
            </p>

            <h1>
              Proceed with
              <br />
              confidence.
            </h1>

            <p className="purchase-complete-description">
              You chose to proceed after
              reviewing the available
              product verification and
              supply-chain information.
            </p>

            <div className="purchase-complete-score">
              <span>
                CONFIDENCE AT DECISION
              </span>

              <strong>
                {score}
                <small>%</small>
              </strong>
            </div>

            <div className="purchase-complete-actions">
              <button
                className="purchase-primary"
                onClick={goToScan}
              >
                Verify another product →
              </button>

              <button
                className="purchase-secondary"
                onClick={() =>
                  setScreen("home")
                }
              >
                Return home
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
     PARTIALLY VERIFIED
  ========================= */

  if (screen === "partial") {
    return (
      <main className="app">
        <section className="result-screen">
          <header className="page-header">
            <button
              className="back-icon"
              onClick={() =>
                setScreen("home")
              }
            >
              ←
            </button>

            <span>
              VERIFICATION RESULT
            </span>

            <div />
          </header>

          <div className="result-content">
            <div className="result-status partial-status">
              <span />
              PARTIALLY VERIFIED
            </div>

            <h1>
              {selectedScan?.name ||
                "Product"}
            </h1>

            <p className="result-type">
              Some product records are
              unavailable or incomplete.
            </p>

            <div className="score-card">
              <div className="score-header">
                <span>
                  CONFIDENCE SCORE
                </span>

                <strong>
                  {(selectedScan?.evidence?.length
                      ? getEvidenceVerificationSummary(selectedScan.evidence).confidenceScore
                      : selectedScan?.score ?? 0)}
                  <small>%</small>
                </strong>
              </div>

              <div className="score-track">
                <div
                  className="score-fill"
                  style={{
                    width: `${
                      selectedScan?.score ??
                      0
                    }%`,
                  }}
                />
              </div>

              <p>
                Some parts of the product
                journey could not be fully
                verified.
              </p>
            </div>

            <button
              className="result-primary"
              onClick={() =>
                setScreen("evidence")
              }
            >
              Explore records
              <span>→</span>
            </button>

            <button
              className="result-secondary"
              onClick={goToScan}
            >
              Verify another product
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
     FLAGGED
  ========================= */

  if (screen === "flagged") {
    return (
      <main className="app">
        <section className="result-screen">
          <header className="page-header">
            <button
              className="back-icon"
              onClick={() =>
                setScreen("home")
              }
            >
              ←
            </button>

            <span>
              VERIFICATION RESULT
            </span>

            <div />
          </header>

          <div className="result-content">
            <div className="result-status flagged-status">
              <span />
              FLAGGED
            </div>

            <h1>
              Record requires
              <br />
              attention.
            </h1>

            <p className="result-type">
              {selectedScan?.name}
            </p>

            <div className="score-card">
              <div className="score-header">
                <span>
                  CONFIDENCE SCORE
                </span>

                <strong>
                  {(selectedScan?.evidence?.length
                      ? getEvidenceVerificationSummary(selectedScan.evidence).confidenceScore
                      : selectedScan?.score ?? 0)}
                  <small>%</small>
                </strong>
              </div>

              <div className="score-track">
                <div
                  className="score-fill"
                  style={{
                    width: `${
                      selectedScan?.score ??
                      0
                    }%`,
                  }}
                />
              </div>

              <p>
                One or more records contain
                information that requires
                further review.
              </p>
            </div>

            <button
              className="result-primary"
              onClick={() =>
                setScreen("evidence")
              }
            >
              View flagged records
              <span>→</span>
            </button>

            <button
              className="result-secondary"
              onClick={() =>
                setScreen("home")
              }
            >
              Exit verification
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
     PRODUCT NOT FOUND
  ========================= */

  if (screen === "not-found") {
    return (
      <main className="app">
        <section className="result-screen">
          <header className="page-header">
            <button
              className="back-icon"
              onClick={() =>
                setScreen("home")
              }
            >
              ←
            </button>

            <span>
              PRODUCT RECORD
            </span>

            <div />
          </header>

          <div className="result-content">
            <div className="result-status not-found-status">
              <span />
              RECORD NOT FOUND
            </div>

            <h1>
              No matching
              <br />
              record found.
            </h1>

            <p className="result-type">
              We could not find a product
              record for{" "}
              <strong>
                {productCode ||
                  "this product"}
              </strong>
              .
            </p>

            <button
              className="result-primary"
              onClick={goToScan}
            >
              Try another code
              <span>→</span>
            </button>

            <button
              className="result-secondary"
              onClick={() =>
                setScreen("home")
              }
            >
              Exit
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
     VERIFIED RESULT
  ========================= */

  if (screen === "result") {
    return (
      <main className="app">
        <section className="result-screen">
          <header className="page-header">
            <button
              className="back-icon"
              onClick={() =>
                setScreen("home")
              }
            >
              ←
            </button>

            <span>
              VERIFICATION RESULT
            </span>

            <div />
          </header>

          <div className="result-content">
            {selectedScan?.image && (
              <div className="result-image">
                <img
                  src={
                    selectedScan.image
                  }
                  alt={
                    selectedScan.name
                  }
                />
              </div>
            )}

            <div className="result-status">
              <span />
              VERIFIED
            </div>

            <h1>
              {selectedScan?.name ||
                "Product"}
            </h1>

            <p className="result-type">
              Batch:{" "}
              {selectedScan?.batchId ||
                "Not available"}
            </p>

            <div className="score-card">
              <div className="score-header">
                <span>
                  CONFIDENCE SCORE
                </span>

                <strong>
                  {(selectedScan?.evidence?.length
                      ? getEvidenceVerificationSummary(selectedScan.evidence).confidenceScore
                      : selectedScan?.score ?? 0)}
                  <small>%</small>
                </strong>
              </div>

              <div className="score-track">
                <div
                  className="score-fill"
                  style={{
                    width: `${
                      selectedScan?.score ??
                      0
                    }%`,
                  }}
                />
              </div>

              <p>
                Based on connected product
                and supply-chain records.
              </p>
            </div>

            <button
              className="result-primary"
              onClick={() =>
                setScreen("evidence")
              }
            >
              View product journey
              <span>→</span>
            </button>

            <button
              className="result-secondary"
              onClick={goToScan}
            >
              Verify another product
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
     SCAN / QR UPLOAD
  ========================= */

  if (screen === "scan") {
    return (
      <main className="app">
        <section className="scan-page">
          <header className="page-header scan-header">
            <button
              className="back-icon"
              onClick={() => {
                setShowCodeInput(false);
                setScanError("");
                setScreen("home");
              }}
            >
              ←
            </button>

            <span>
              PRODUCT VERIFICATION
            </span>

            <div className="header-empty" />
          </header>

          <div className="scan-content">
            <div className="scan-copy">
              <p className="eyebrow">
                PRODUCT IDENTIFICATION
              </p>

              <h1>
                Verify before
                <br />
                you trust.
              </h1>

              <p className="description">
                Upload a SAFAL QR code image
                or enter the unique product
                code to access its
                verification record and
                supply-chain information.
              </p>
            </div>

            <div className="scan-panel">

              {!showCodeInput && (
                <div className="scan-start">

                  <div className="scan-visual">
                    <div className="scan-corners">
                      <span className="corner top-left" />
                      <span className="corner top-right" />
                      <span className="corner bottom-left" />
                      <span className="corner bottom-right" />
                    </div>

                    <div className="scan-icon">
                      ◉
                    </div>
                  </div>

                  <div className="scan-start-copy">
                    <span className="scan-label">
                      PRODUCT QR
                    </span>

                    <h2>
                      Ready to identify
                    </h2>

                    <p>
                      Upload a SAFAL QR code
                      image from your gallery,
                      or enter its unique
                      product code.
                    </p>
                  </div>

                  <div className="scan-actions">

                    <label
                      className={`scan-primary upload-qr-button ${
                        loading
                          ? "disabled"
                          : ""
                      }`}
                    >
                      {loading
                        ? "Reading QR..."
                        : "Upload QR image"}

                      <span>→</span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleQRUpload
                        }
                        disabled={loading}
                        hidden
                      />
                    </label>

                    <button
                      className="scan-secondary"
                      onClick={() => {
                        setShowCodeInput(
                          true
                        );
                        setScanError("");
                      }}
                      disabled={loading}
                    >
                      Enter product code
                    </button>

                    {scanError && (
                      <p className="scan-error">
                        {scanError}
                      </p>
                    )}

                  </div>
                </div>
              )}

              {showCodeInput && (
                <div className="code-entry">

                  <div className="code-entry-header">
                    <button
                      className="code-back"
                      onClick={() => {
                        setShowCodeInput(
                          false
                        );
                        setProductCode("");
                        setScanError("");
                      }}
                    >
                      ←
                    </button>

                    <div>
                      <span>
                        PRODUCT CODE
                      </span>

                      <h2>
                        Enter verification code
                      </h2>

                      <p>
                        Use the unique SAFAL
                        code associated with
                        the product.
                      </p>
                    </div>
                  </div>

                  <div className="code-form">
                    <label>
                      SAFAL PRODUCT CODE
                    </label>

                    <input
                      type="text"
                      value={productCode}
                      onChange={(e) => {
                        setProductCode(
                          e.target.value.toUpperCase()
                        );

                        setScanError("");
                      }}
                      placeholder="SAFAL-COCO-001"
                    />

                    {scanError && (
                      <p className="scan-error">
                        {scanError}
                      </p>
                    )}

                    <button
                      className="scan-primary verify-code-button"
                      onClick={() =>
                        verifyProduct(
                          productCode
                        )
                      }
                      disabled={loading}
                    >
                      {loading
                        ? "Verifying..."
                        : "Verify product"}

                      <span>→</span>
                    </button>
                  </div>

                  <div className="supported-codes">
                    <span>
                      DEMO VERIFICATION
                      CODES
                    </span>

                    <div className="code-list">

                      <button
                        onClick={() =>
                          setProductCode(
                            "SAFAL-COCO-001"
                          )
                        }
                      >
                        SAFAL-COCO-001
                      </button>

                      <button
                        onClick={() =>
                          setProductCode(
                            "SAFAL-HONEY-002"
                          )
                        }
                      >
                        SAFAL-HONEY-002
                      </button>

                      <button
                        onClick={() =>
                          setProductCode(
                            "SAFAL-SERUM-003"
                          )
                        }
                      >
                        SAFAL-SERUM-003
                      </button>

                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      </main>
    );
  }
  if (screen === "distributor-workspace") {
    return (
      <main className="app">
        {successMessage && (
          <div className="safal-toast" role="status" aria-live="polite">
            <div className="safal-toast-mark">✓</div>
            <div className="safal-toast-copy">
              <span className="safal-toast-eyebrow">SAVED</span>
              <span className="safal-toast-message">{successMessage}</span>
            </div>
            <button
              type="button"
              className="safal-toast-close"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss notification"
            >
              ×
            </button>
            <span className="safal-toast-line" />
          </div>
        )}
<section className="profile-screen">
        <header className="page-header"><button className="back-icon" onClick={() => setScreen("home")}>←</button><span>DISTRIBUTOR WORKSPACE</span><div /></header>
        <div className="profile-content"><div className="profile-intro"><p className="eyebrow">SUPPLY CHAIN • DISTRIBUTOR</p><h1>Move the<br />product forward.</h1><p className="description">Record product movement from one supply-chain location to another.</p></div>
          <div className="role-list">
            <button className="role-card" onClick={() => { resetDistributorForm(); loadDistributorProducts(); setScreen("distributor-add-record"); }}><div className="role-number">01</div><div className="role-info"><h2>Add Distribution Record</h2><p>Record a product shipment or transfer.</p></div><span className="role-arrow">→</span></button>
            <button className="role-card" onClick={() => { setDistributorError(""); loadDistributorProducts(); setScreen("distributor-products"); }}><div className="role-number">02</div><div className="role-info"><h2>Products to Distribute</h2><p>View products available for distribution.</p></div><span className="role-arrow">→</span></button>
            <button className="role-card" onClick={() => { setDistributorError(""); loadDistributorRecords(); setScreen("distributor-records"); }}><div className="role-number">03</div><div className="role-info"><h2>Distribution Records</h2><p>View your recorded product movements.</p></div><span className="role-arrow">→</span></button>
          </div>
        </div>
      </section></main>
    );
  }

  if (screen === "distributor-products") {
    return (<main className="app"><section className="profile-screen"><header className="page-header"><button className="back-icon" onClick={() => setScreen("distributor-workspace")}>←</button><span>PRODUCTS TO DISTRIBUTE</span><div /></header><div className="profile-content"><div className="profile-intro"><p className="eyebrow">DISTRIBUTOR • AVAILABLE PRODUCTS</p><h1>Products ready<br />for distribution.</h1><p className="description">Products currently registered in SAFAL.</p></div>{distributorError && <p className="scan-error">{distributorError}</p>}<div className="role-list">{distributorProducts.length === 0 && !distributorLoading ? <div className="empty-state"><p>No products available yet.</p></div> : distributorProducts.map((item,index)=><button key={item.id} className="role-card" onClick={()=>{setDistributorProductId(item.id);setScreen("distributor-add-record");}}><div className="role-number">{String(index+1).padStart(2,"0")}</div><div className="role-info"><h2>{item.product_name}</h2><p>{item.product_code} • Batch: {item.batch_id || "N/A"}</p></div><span className="role-arrow">→</span></button>)}</div></div></section></main>);
  }

  if (screen === "distributor-records") {
    return (<main className="app"><section className="profile-screen"><header className="page-header"><button className="back-icon" onClick={() => setScreen("distributor-workspace")}>←</button><span>DISTRIBUTION RECORDS</span><div /></header><div className="profile-content"><div className="profile-intro"><p className="eyebrow">DISTRIBUTOR • RECORD HISTORY</p><h1>Your distribution<br />records.</h1><p className="description">Product movements, evidence and verification status.</p></div>{distributorError&&<p className="scan-error">{distributorError}</p>}<button className="profile-continue-button" onClick={()=>{resetDistributorForm();loadDistributorProducts();setScreen("distributor-add-record");}}><div><span>DISTRIBUTION RECORD</span><strong>Add / Upload Evidence</strong></div><span>→</span></button><div className="role-list">{distributorRecords.length===0&&!distributorLoading?<div className="empty-state"><p>No distribution records yet.</p><p className="description">Create a distribution record first. You can upload supporting evidence with it.</p></div>:distributorRecords.map((item,index)=><div key={item.id} className="role-card" style={{display:"block"}}><div style={{display:"flex",alignItems:"center",gap:"14px"}}><div className="role-number">{String(index+1).padStart(2,"0")}</div><div className="role-info" style={{flex:1}}><h2>{item.products?.product_name||"Product"}</h2><p>{item.distribution_from} → {item.distribution_to} • {item.distribution_date||"No date"}</p></div><span className="role-arrow">{item.verification_status||"pending"}</span></div><div style={{marginTop:"18px",paddingTop:"16px",borderTop:"1px solid rgba(0,0,0,.08)"}}><strong>EVIDENCE</strong>{item.evidence?.length?item.evidence.map(evidence=><div key={evidence.id} style={{marginTop:"10px"}}><div style={{display:"flex",justifyContent:"space-between",gap:"10px",alignItems:"center"}}><div><p style={{margin:0}}><strong>{evidence.evidence_type}</strong></p><p style={{margin:"4px 0 0"}}>{evidence.file_name}</p></div><span>{evidence.verification_status||"pending"}</span></div><div style={{display:"flex",gap:"8px",marginTop:"8px",flexWrap:"wrap"}}><button type="button" onClick={async()=>{try{await viewEvidenceFile(evidence.file_path);}catch(error){setDistributorError(error.message||"Unable to open evidence.");}}}>View</button></div></div>):<p>No evidence uploaded for this record.</p>}{renderHistoryEvidenceUploader({
  item,
  role: "distributor",
  recordType: "distribution",
  recordDate: item.distribution_date,
  setError: setDistributorError,
  onSuccess: loadDistributorRecords,
})}</div></div>)}</div></div></section></main>);
  }
  if (screen === "distributor-add-record") {
    const selected = distributorProducts.find(item => item.id === distributorProductId);
    return (
      <main className="app">
        <section className="profile-setup-screen">
          <header className="page-header">
            <button
              className="back-icon"
              onClick={() => {
                resetDistributorForm();
                setScreen("distributor-workspace");
              }}
            >
              ←
            </button>
            <span>ADD DISTRIBUTION RECORD</span>
            <div />
          </header>

          <div className="profile-setup-content">
            <div className="profile-setup-intro">
              <p className="eyebrow">DISTRIBUTOR • PRODUCT MOVEMENT</p>
              <h1>Record the<br />product movement.</h1>
              <p className="description">
                Connect a shipment or transfer to an existing SAFAL product.
              </p>
            </div>

            <div className="profile-form">
              <div className="profile-field">
                <label>SELECT PRODUCT</label>
                <select
                  value={distributorProductId}
                  onChange={e => setDistributorProductId(e.target.value)}
                >
                  <option value="">Select a product</option>
                  {distributorProducts.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.product_name} — {item.product_code}
                    </option>
                  ))}
                </select>
              </div>

              {selected && (
                <div className="profile-field">
                  <label>PRODUCT INFORMATION</label>
                  <p><strong>Product:</strong> {selected.product_name}</p>
                  <p><strong>Code:</strong> {selected.product_code}</p>
                  <p><strong>Batch:</strong> {selected.batch_id || "Not available"}</p>
                </div>
              )}

              <div className="profile-field">
                <label>DISTRIBUTION DATE</label>
                <input
                  type="date"
                  value={distributionDate}
                  onChange={e => setDistributionDate(e.target.value)}
                />
              </div>

              <div className="profile-field">
                <label>FROM</label>
                <input
                  type="text"
                  value={distributionFrom}
                  onChange={e => setDistributionFrom(e.target.value)}
                  placeholder="Warehouse / location"
                />
              </div>

              <div className="profile-field">
                <label>TO</label>
                <input
                  type="text"
                  value={distributionTo}
                  onChange={e => setDistributionTo(e.target.value)}
                  placeholder="Destination / retailer"
                />
              </div>

              <div className="profile-field">
                <label>
                  QUANTITY <span className="optional">OPTIONAL</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={distributionQuantity}
                  onChange={e => setDistributionQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="profile-field">
                <label>
                  DETAILS <span className="optional">OPTIONAL</span>
                </label>
                <textarea
                  value={distributionDetails}
                  onChange={e => setDistributionDetails(e.target.value)}
                  placeholder="Describe the movement..."
                  rows={5}
                />
              </div>

              {renderEvidenceSlots("distributor")}

            </div>

            {distributorError && (
              <p className="scan-error">{distributorError}</p>
            )}

            <button
              className="profile-continue-button"
              onClick={handleDistributorRecordSave}
              disabled={distributorLoading}
            >
              <div>
                <span>DISTRIBUTION RECORD</span>
                <strong>
                  {distributorLoading ? "Saving..." : "Save Record"}
                </strong>
              </div>
              <span>→</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "retailer-workspace") {
    return (<main className="app">
        {successMessage && (
          <div className="safal-toast" role="status" aria-live="polite">
            <div className="safal-toast-mark">✓</div>
            <div className="safal-toast-copy">
              <span className="safal-toast-eyebrow">SAVED</span>
              <span className="safal-toast-message">{successMessage}</span>
            </div>
            <button
              type="button"
              className="safal-toast-close"
              onClick={() => setSuccessMessage("")}
              aria-label="Dismiss notification"
            >
              ×
            </button>
            <span className="safal-toast-line" />
          </div>
        )}
<section className="profile-screen"><header className="page-header"><button className="back-icon" onClick={() => setScreen("home")}>←</button><span>RETAILER WORKSPACE</span><div /></header><div className="profile-content"><div className="profile-intro"><p className="eyebrow">SUPPLY CHAIN • RETAILER</p><h1>Bring the product<br />to the customer.</h1><p className="description">Record when products reach the retail stage.</p></div><div className="role-list"><button className="role-card" onClick={()=>{resetRetailerForm();loadRetailerProducts();setScreen("retailer-add-record");}}><div className="role-number">01</div><div className="role-info"><h2>Add Retail Record</h2><p>Record product receipt and retail availability.</p></div><span className="role-arrow">→</span></button><button className="role-card" onClick={()=>{setRetailerError("");loadRetailerProducts();setScreen("retailer-products");}}><div className="role-number">02</div><div className="role-info"><h2>Products in Store</h2><p>View products available for retail.</p></div><span className="role-arrow">→</span></button><button className="role-card" onClick={()=>{setRetailerError("");loadRetailerRecords();setScreen("retailer-records");}}><div className="role-number">03</div><div className="role-info"><h2>Retail Records</h2><p>View your recorded retail entries.</p></div><span className="role-arrow">→</span></button></div></div></section></main>);
  }

  if (screen === "retailer-products") {
    return (<main className="app"><section className="profile-screen"><header className="page-header"><button className="back-icon" onClick={() => setScreen("retailer-workspace")}>←</button><span>PRODUCTS IN STORE</span><div /></header><div className="profile-content"><div className="profile-intro"><p className="eyebrow">RETAILER • AVAILABLE PRODUCTS</p><h1>Products ready<br />for retail.</h1><p className="description">Products currently registered in SAFAL.</p></div>{retailerError&&<p className="scan-error">{retailerError}</p>}<div className="role-list">{retailerProducts.length===0&&!retailerLoading?<div className="empty-state"><p>No products available yet.</p></div>:retailerProducts.map((item,index)=><button key={item.id} className="role-card" onClick={()=>{setRetailerProductId(item.id);setScreen("retailer-add-record");}}><div className="role-number">{String(index+1).padStart(2,"0")}</div><div className="role-info"><h2>{item.product_name}</h2><p>{item.product_code} • Batch: {item.batch_id||"N/A"}</p></div><span className="role-arrow">→</span></button>)}</div></div></section></main>);
  }

  if (screen === "retailer-records") {
    return (<main className="app"><section className="profile-screen"><header className="page-header"><button className="back-icon" onClick={() => setScreen("retailer-workspace")}>←</button><span>RETAIL RECORDS</span><div /></header><div className="profile-content"><div className="profile-intro"><p className="eyebrow">RETAILER • RECORD HISTORY</p><h1>Your retail<br />records.</h1><p className="description">Retail records, evidence and verification status.</p></div>{retailerError&&<p className="scan-error">{retailerError}</p>}<button className="profile-continue-button" onClick={()=>{resetRetailerForm();loadRetailerProducts();setScreen("retailer-add-record");}}><div><span>RETAIL RECORD</span><strong>Add / Upload Evidence</strong></div><span>→</span></button><div className="role-list">{retailerRecords.length===0&&!retailerLoading?<div className="empty-state"><p>No retail records yet.</p><p className="description">Create a retail record first. You can upload supporting evidence with it.</p></div>:retailerRecords.map((item,index)=><div key={item.id} className="role-card" style={{display:"block"}}><div style={{display:"flex",alignItems:"center",gap:"14px"}}><div className="role-number">{String(index+1).padStart(2,"0")}</div><div className="role-info" style={{flex:1}}><h2>{item.products?.product_name||"Product"}</h2><p>{item.retail_location} • {item.retail_date||"No date"}</p></div><span className="role-arrow">{item.verification_status||"pending"}</span></div><div style={{marginTop:"18px",paddingTop:"16px",borderTop:"1px solid rgba(0,0,0,.08)"}}><strong>EVIDENCE</strong>{item.evidence?.length?item.evidence.map(evidence=><div key={evidence.id} style={{marginTop:"10px"}}><div style={{display:"flex",justifyContent:"space-between",gap:"10px",alignItems:"center"}}><div><p style={{margin:0}}><strong>{evidence.evidence_type}</strong></p><p style={{margin:"4px 0 0"}}>{evidence.file_name}</p></div><span>{evidence.verification_status||"pending"}</span></div><div style={{display:"flex",gap:"8px",marginTop:"8px",flexWrap:"wrap"}}><button type="button" onClick={async()=>{try{await viewEvidenceFile(evidence.file_path);}catch(error){setRetailerError(error.message||"Unable to open evidence.");}}}>View</button></div></div>):<p>No evidence uploaded for this record.</p>}{renderHistoryEvidenceUploader({
  item,
  role: "retailer",
  recordType: "retail",
  recordDate: item.retail_date,
  setError: setRetailerError,
  onSuccess: loadRetailerRecords,
})}</div></div>)}</div></div></section></main>);
  }
  if (screen === "retailer-add-record") {
    const selected = retailerProducts.find(item => item.id === retailerProductId);
    return (
      <main className="app">
        <section className="profile-setup-screen">
          <header className="page-header">
            <button
              className="back-icon"
              onClick={() => {
                resetRetailerForm();
                setScreen("retailer-workspace");
              }}
            >
              ←
            </button>
            <span>ADD RETAIL RECORD</span>
            <div />
          </header>

          <div className="profile-setup-content">
            <div className="profile-setup-intro">
              <p className="eyebrow">RETAILER • PRODUCT RECEIPT</p>
              <h1>Record the<br />retail stage.</h1>
              <p className="description">
                Connect the product to its retail location.
              </p>
            </div>

            <div className="profile-form">
              <div className="profile-field">
                <label>SELECT PRODUCT</label>
                <select
                  value={retailerProductId}
                  onChange={e => setRetailerProductId(e.target.value)}
                >
                  <option value="">Select a product</option>
                  {retailerProducts.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.product_name} — {item.product_code}
                    </option>
                  ))}
                </select>
              </div>

              {selected && (
                <div className="profile-field">
                  <label>PRODUCT INFORMATION</label>
                  <p><strong>Product:</strong> {selected.product_name}</p>
                  <p><strong>Code:</strong> {selected.product_code}</p>
                  <p><strong>Batch:</strong> {selected.batch_id || "Not available"}</p>
                </div>
              )}

              <div className="profile-field">
                <label>RETAIL DATE</label>
                <input
                  type="date"
                  value={retailDate}
                  onChange={e => setRetailDate(e.target.value)}
                />
              </div>

              <div className="profile-field">
                <label>RETAIL LOCATION</label>
                <input
                  type="text"
                  value={retailLocation}
                  onChange={e => setRetailLocation(e.target.value)}
                  placeholder="Store / retail location"
                />
              </div>

              <div className="profile-field">
                <label>
                  QUANTITY RECEIVED <span className="optional">OPTIONAL</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={retailQuantity}
                  onChange={e => setRetailQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="profile-field">
                <label>
                  DETAILS <span className="optional">OPTIONAL</span>
                </label>
                <textarea
                  value={retailDetails}
                  onChange={e => setRetailDetails(e.target.value)}
                  placeholder="Describe the retail entry..."
                  rows={5}
                />
              </div>

              {renderEvidenceSlots("retailer")}

            </div>

            {retailerError && (
              <p className="scan-error">{retailerError}</p>
            )}

            <button
              className="profile-continue-button"
              onClick={handleRetailerRecordSave}
              disabled={retailerLoading}
            >
              <div>
                <span>RETAIL RECORD</span>
                <strong>
                  {retailerLoading ? "Saving..." : "Save Record"}
                </strong>
              </div>
              <span>→</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* =========================
   ROLE SELECTION
========================= */

const selectRole = async (role) => {
  setSelectedRole(role);
  setProfileError("");

  let existingRole =
    roleProfiles.find(
      (item) => item.role === role
    );

  if (!existingRole && currentProfile?.id) {
    const {
      data,
      error,
    } = await supabase
      .from("role_profiles")
      .select("*")
      .eq("profile_id", currentProfile.id)
      .eq("role", role)
      .maybeSingle();

    if (error) {
      console.error(
        "ROLE CHECK ERROR:",
        error
      );
    }

    if (data) {
      existingRole = data;

      setRoleProfiles((previous) => {
        const withoutRole =
          previous.filter(
            (item) =>
              item.role !== role
          );

        return [
          ...withoutRole,
          data,
        ];
      });
    }
  }

  if (existingRole) {
    const updatedProfile = {
      ...currentProfile,
      activeRole: role,
    };

    setCurrentProfile(updatedProfile);

    localStorage.setItem(
      "safal_profile",
      JSON.stringify(updatedProfile)
    );

    setScreen(
      role === "consumer"
        ? "home"
        : role === "producer"
        ? "producer-workspace"
        : role === "processor"
        ? "processor-workspace"
        : role === "distributor"
        ? "distributor-workspace"
        : role === "retailer"
        ? "retailer-workspace"
        : "home"
    );

    return;
  }

  setProfileName(
    currentProfile?.name || ""
  );

  setBusinessName("");
  setBusinessLocation("");
  setRegistrationNumber("");
  setProfileBio("");
  setEditingRole(null);
  setProfileError("");

  setScreen("profile-setup");
};

    
 /* =========================
   MY PROFILE
========================= */

const editRoleProfile = (role) => {
  setEditingRole(role);
  setSelectedRole(role.role);

  setProfileName(currentProfile?.name || "");
  setProfileBio(role.bio || "");
  setBusinessName(role.business_name || "");
  setBusinessLocation(role.business_location || "");
  setRegistrationNumber(role.registration_number || "");
  setProfileError("");

  setScreen("profile-setup");
};

function resetProcessorForm() {
  setProcessorProductId("");
  setProcessingType("");
  setProcessingDate("");
  setProcessingLocation("");
  setQuantityProcessed("");
  setProcessingDetails("");
  setEvidenceFiles([]);
  setEvidenceType("Other");
  setProcessorError("");
}

async function loadProcessorProducts() {
  setProcessorLoading(true);
  setProcessorError("");

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, product_name, product_code, batch_id, category"
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    setProcessorProducts(data || []);
  } catch (error) {
    console.error(
      "PROCESSOR PRODUCTS LOAD ERROR:",
      error
    );

    setProcessorError(
      error.message ||
        "Unable to load products."
    );
  } finally {
    setProcessorLoading(false);
  }
}

async function handleProcessorRecordSave() {
  if (
    !processorProductId ||
    !processingType.trim() ||
    !processingDate
  ) {
    setProcessorError(
      "Please select a product, processing type and processing date."
    );
    return;
  }

  if (!currentProfile?.id) {
    setProcessorError(
      "Processor profile not found. Please select your processor role again."
    );
    return;
  }

  setProcessorLoading(true);
  setProcessorError("");

  try {
    const { error } = await supabase
      .from("processor_records")
      .upsert(
        {
          profile_id: currentProfile.id,
          product_id: processorProductId,
          processing_type: processingType.trim(),
          processing_date: processingDate,
          processing_location: processingLocation.trim() || null,
          quantity_processed: quantityProcessed
            ? Number(quantityProcessed)
            : null,
          processing_details: processingDetails.trim() || null,
          verification_status: "pending",
        },
        {
          onConflict: "product_id,profile_id",
        }
      );

    if (error) {
      throw error;
    }

    const {
      data: supplyChainRecord,
      error: supplyChainError,
    } = await supabase
      .from("supply_chain_records")
      .insert({
        product_id: processorProductId,
        contributor_id: currentProfile.id,
        role: "processor",
        record_type: "processing",
        location: processingLocation.trim() || null,
        facility_name: currentProfile.name || "Processor",
        record_date: processingDate,
        description:
          processingDetails.trim() ||
          processingType.trim() ||
          "Processing record added.",
        verification_status: "pending",
      })
      .select("id")
      .single();

    if (supplyChainError) {
      throw supplyChainError;
    }

    await saveEvidenceFiles({
      productId: processorProductId,
      supplyChainRecordId: supplyChainRecord.id,
      role: "processor",
      evidenceItems: getEvidenceItems(),
    });

    showSuccessMessage(
      getEvidenceItems().length > 0
        ? "Processing record and evidence added successfully."
        : "Processing record added successfully."
    );

    resetProcessorForm();
    setScreen("processor-workspace");
  } catch (error) {
    console.error(
      "PROCESSOR RECORD SAVE ERROR:",
      error
    );

    setProcessorError(
      error.message ||
        "Unable to save processing record."
    );
  } finally {
    setProcessorLoading(false);
  }
}

  if (screen === "verification-console-login") {
    return (<main className="app"><section className="profile-setup-screen"><header className="page-header"><button className="back-icon" onClick={()=>{setCreatorPin("");setVerificationConsoleError("");setScreen("my-profile");}}>←</button><span>INTERNAL ACCESS</span><div /></header><div className="profile-setup-content"><div className="profile-setup-intro"><p className="eyebrow">SAFAL INTERNAL</p><h1>Verification<br/>Console.</h1><p className="description">Internal evidence review. Supply-chain contributors do not approve their own evidence.</p></div><div className="profile-form"><div className="profile-field"><label>CREATOR ACCESS PIN</label><input type="password" value={creatorPin} onChange={e=>{setCreatorPin(e.target.value);setVerificationConsoleError("");}} placeholder="Enter internal PIN" onKeyDown={e=>{if(e.key==="Enter")authenticateVerificationConsole();}}/></div></div>{verificationConsoleError&&<p className="scan-error">{verificationConsoleError}</p>}<button className="profile-continue-button" onClick={authenticateVerificationConsole}><div><span>SAFAL INTERNAL</span><strong>Open Verification Console</strong></div><span>→</span></button><div className="profile-setup-note"><span>01</span><p>Prototype access control only. Production SAFAL would use authenticated internal accounts and server-side authorization.</p></div></div></section></main>);
  }

  if (screen === "verification-console") {
    if (!creatorAuthenticated) { setScreen("verification-console-login"); return null; }
    return (<main className="app"><section className="profile-screen"><header className="page-header"><button className="back-icon" onClick={()=>setScreen("my-profile")}>←</button><span>VERIFICATION CONSOLE</span><button type="button" onClick={()=>{setCreatorAuthenticated(false);setVerificationQueue([]);setScreen("home");}}>Exit</button></header><div className="profile-content"><div className="profile-intro"><p className="eyebrow">SAFAL INTERNAL • HUMAN REVIEW</p><h1>Evidence<br/>review queue.</h1><p className="description">AI assists with evidence analysis. Final verification is decided here by a human reviewer.</p></div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",marginBottom:"18px",flexWrap:"wrap"}}><div><strong>{verificationQueue.length}</strong> pending evidence item{verificationQueue.length===1?"":"s"}</div><button type="button" onClick={loadVerificationQueue} disabled={verificationConsoleLoading}>{verificationConsoleLoading?"Refreshing...":"Refresh"}</button></div>{verificationConsoleError&&<p className="scan-error">{verificationConsoleError}</p>}<div className="role-list">{verificationQueue.length===0&&!verificationConsoleLoading?<div className="empty-state"><p>No evidence is waiting for review.</p><p className="description">New evidence uploaded by supply-chain roles will appear here.</p></div>:verificationQueue.map((evidence,index)=>{const productData=evidence.products||{},record=evidence.record||{},roleProfile=evidence.roleProfile||{},aiLoading=!!evidenceAiLoading[evidence.id],reviewBusy=!!reviewLoading[evidence.id],confidence=evidence.ai_confidence==null?null:(Number(evidence.ai_confidence)<=1?Math.round(Number(evidence.ai_confidence)*100):Math.round(Number(evidence.ai_confidence))),findings=typeof evidence.ai_findings==="string"?evidence.ai_findings:evidence.ai_findings?JSON.stringify(evidence.ai_findings):"";return (<div key={evidence.id} className="role-card" style={{display:"block"}}><div style={{display:"flex",alignItems:"flex-start",gap:"14px"}}><div className="role-number">{String(index+1).padStart(2,"0")}</div><div className="role-info" style={{flex:1}}><h2>{productData.product_name||"Product"}</h2><p>{evidence.evidence_type} • {evidence.role?.toUpperCase()||"ROLE"}</p><p>Code: {productData.product_code||"N/A"} • Batch: {productData.batch_id||"N/A"}</p></div><span className="role-arrow">{evidence.verification_status||"pending"}</span></div><div style={{marginTop:"18px",paddingTop:"16px",borderTop:"1px solid rgba(0,0,0,.08)"}}><p style={{margin:"0 0 6px"}}><strong>EVIDENCE FILE</strong></p><p style={{margin:"0 0 8px"}}>{evidence.file_name}</p><p style={{margin:"6px 0"}}><strong>Business:</strong> {roleProfile.business_name||"Not provided"}</p><p style={{margin:"6px 0"}}><strong>Location:</strong> {roleProfile.business_location||record.location||"Not provided"}</p><p style={{margin:"6px 0"}}><strong>Record:</strong> {record.record_type||"Not provided"}{record.record_date?` • ${record.record_date}`:""}</p><div style={{display:"flex",gap:"8px",marginTop:"12px",flexWrap:"wrap"}}><button type="button" onClick={async()=>{try{await viewEvidenceFile(evidence.file_path);}catch(error){setVerificationConsoleError(error.message||"Unable to open evidence.");}}}>View Evidence</button><button type="button" onClick={async()=>{try{await analyzeEvidenceWithAI({...evidence,role_record_id:record.id});}catch(error){setVerificationConsoleError(error.message||"Unable to analyze evidence.");}}} disabled={aiLoading||reviewBusy}>{aiLoading?"AI Analyzing...":"Run AI Analysis"}</button></div><div style={{marginTop:"16px",padding:"14px",border:"1px solid rgba(0,0,0,.10)",borderRadius:"10px"}}><strong>AI ANALYSIS</strong>{!evidence.ai_analyzed_at?<p className="description" style={{marginTop:"8px"}}>AI analysis has not been run for this evidence yet.</p>:<><p style={{margin:"8px 0"}}><strong>Recommendation:</strong> {evidence.ai_recommendation||"review"}</p><p style={{margin:"8px 0"}}><strong>Risk:</strong> {evidence.ai_risk_level||"not available"}</p><p style={{margin:"8px 0"}}><strong>Document type:</strong> {evidence.ai_document_type||"not identified"}</p>{confidence!==null&&<p style={{margin:"8px 0"}}><strong>AI confidence:</strong> {confidence}%</p>}{findings&&<div style={{marginTop:"10px"}}><strong>Findings</strong><p style={{margin:"6px 0 0",whiteSpace:"pre-wrap"}}>{findings}</p></div>}</>}</div><div style={{marginTop:"16px",padding:"14px",border:"1px solid rgba(0,0,0,.10)",borderRadius:"10px"}}><label>REVIEWER COMMENT <span className="optional">OPTIONAL</span></label><textarea rows={4} value={reviewComments[evidence.id]||""} onChange={e=>setReviewComments(p=>({...p,[evidence.id]:e.target.value}))} placeholder="Add a note explaining the approval or rejection..." disabled={reviewBusy}/><div style={{display:"flex",gap:"8px",marginTop:"10px",flexWrap:"wrap"}}><button type="button" disabled={reviewBusy} onClick={async()=>{try{await reviewEvidence({evidenceId:evidence.id,role:evidence.role,roleRecordId:record.id,productId:evidence.product_id,recordType:record.record_type,recordDate:record.record_date,decision:"approved"});}catch(error){setVerificationConsoleError(error.message||"Unable to approve evidence.");}}}>{reviewBusy?"Saving...":"Approve"}</button><button type="button" disabled={reviewBusy} onClick={async()=>{try{await reviewEvidence({evidenceId:evidence.id,role:evidence.role,roleRecordId:record.id,productId:evidence.product_id,recordType:record.record_type,recordDate:record.record_date,decision:"rejected"});}catch(error){setVerificationConsoleError(error.message||"Unable to reject evidence.");}}}>{reviewBusy?"Saving...":"Reject"}</button></div><p className="description" style={{marginTop:"10px"}}>AI is advisory only. Approval or rejection here is the final human verification decision.</p></div></div></div>);})}</div></div></section></main>);
  }


if (screen === "my-profile") {
  const activeRole =
    currentProfile?.activeRole ||
    selectedRole ||
    "consumer";

  const roleLabel =
    activeRole.charAt(0).toUpperCase() +
    activeRole.slice(1);

  const configuredRoles =
    roleProfiles || [];

  return (
    <main className="app">
      <section className="profile-screen">

        <header className="page-header">

          <button
            className="back-icon"
            onClick={() =>
              setScreen("home")
            }
          >
            ←
          </button>

          <span>
            MY PROFILE
          </span>

          <div />

        </header>

        <div className="profile-content">

          <div className="profile-intro">

            <p className="eyebrow">
              SAFAL ACCOUNT
            </p>

            <h1>
              Welcome back,
              <br />
              {currentProfile?.name ||
                "there"}.
            </h1>

            <p className="description">
              Manage your SAFAL roles and
              switch between the parts of
              the product journey you
              participate in.
            </p>

          </div>


          {/* CURRENT ROLE */}

          <div className="current-role-card">

            <div>
              <span className="eyebrow">
                CURRENT ROLE
              </span>

              <h2>
                {roleLabel}
              </h2>
            </div>

            <span className="role-active">
              ACTIVE
            </span>

          </div>


          {/* CONFIGURED ROLES */}

          <div className="profile-roles-section">

            <p className="eyebrow">
              YOUR ROLES
            </p>

            <h2>
              Configured roles
            </h2>

            <div className="role-list">

              {configuredRoles.map(
                (role) => {

                  const label =
                    role.role
                      .charAt(0)
                      .toUpperCase() +
                    role.role.slice(1);

                  const isActive =
                    role.role ===
                    activeRole;

                  return (
                    <div
                      key={role.id}
                      className={`role-card ${
                        isActive
                          ? "active-role-card"
                          : ""
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (isActive) return;

                        const updatedProfile = {
                          ...currentProfile,
                          activeRole: role.role,
                        };

                        setCurrentProfile(updatedProfile);
                        setSelectedRole(role.role);

                        localStorage.setItem(
                          "safal_profile",
                          JSON.stringify(updatedProfile)
                        );

                        setScreen(
                            role.role === "consumer"
                              ? "home"
                              : role.role === "producer"
                              ? "producer-workspace"
                              : role.role === "processor"
                              ? "processor-workspace"
                              : role.role === "distributor"
                              ? "distributor-workspace"
                              : role.role === "retailer"
                              ? "retailer-workspace"
                              : "home"
                          );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (isActive) return;

                          const updatedProfile = {
                            ...currentProfile,
                            activeRole: role.role,
                          };

                          setCurrentProfile(updatedProfile);
                          setSelectedRole(role.role);

                          localStorage.setItem(
                            "safal_profile",
                            JSON.stringify(updatedProfile)
                          );

                          setScreen(
                            role.role === "consumer"
                              ? "home"
                              : role.role === "producer"
                              ? "producer-workspace"
                              : role.role === "processor"
                              ? "processor-workspace"
                              : role.role === "distributor"
                              ? "distributor-workspace"
                              : role.role === "retailer"
                              ? "retailer-workspace"
                              : "home"
                          );
                        }
                      }}
                    >

                      <div className="role-number">
                        {String(
                          configuredRoles.indexOf(
                            role
                          ) + 1
                        ).padStart(2, "0")}
                      </div>

                      <div className="role-info">

                        <h2>
                          {label}
                        </h2>

                        <p>
                          {isActive
                            ? "Currently active"
                            : "Switch to this role"}
                        </p>

                      </div>

                      <span className="role-arrow">
                        {isActive
                          ? "✓"
                          : "→"}
                      </span>

                      <span
                        className="role-edit-button"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          editRoleProfile(role);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            editRoleProfile(role);
                          }
                        }}
                      >
                        Edit
                      </span>

                    </div>
                  );
                }
              )}

            </div>

          </div>


          {/* ADD ROLE */}

          <button
            className="profile-continue-button"
            onClick={() =>
              setScreen("profile")
            }
          >
            <div>

              <span>
                ROLE MANAGEMENT
              </span>

              <strong>
                Add another role
              </strong>

            </div>

            <span>
              →
            </span>

          </button>
                    {/* INTERNAL VERIFICATION CONSOLE */}

          <div
            style={{
              marginTop: "28px",
              paddingTop: "22px",
              borderTop: "1px solid rgba(0,0,0,.10)"
            }}
          >
            <p className="eyebrow">
              INTERNAL
            </p>

            <h2>
              SAFAL Verification Console
            </h2>

            <p className="description">
              Internal evidence review. This is separate from the five public SAFAL roles.
            </p>

            <button
              className="profile-continue-button"
              type="button"
              onClick={openVerificationConsole}
            >
              <div>
                <span>
                  SAFAL INTERNAL
                </span>

                <strong>
                  Open Verification Console
                </strong>
              </div>

              <span>
                →
              </span>
            </button>
          </div>

        </div>

      </section>
    </main>
  );
}
  /* =========================
     PROFILE / ROLE SELECTION
  ========================= */

  if (screen === "profile") {
    return (
      <main className="app">
        <section className="profile-screen">

          <header className="page-header">
            <button
              className="back-icon"
              onClick={() => setScreen("home")}
            >
              ←
            </button>

            <span>
              PROFILE
            </span>

            <div />
          </header>

          <div className="profile-content">

            <div className="profile-intro">
              <p className="eyebrow">
                SAFAL ACCOUNT
              </p>

              <h1>
                How do you
                <br />
                participate?
              </h1>

              <p className="description">
                Select your role in the
                product journey. Your SAFAL
                workspace will be customised
                based on how you interact
                with products and records.
              </p>
            </div>

            <div className="role-list">

              {/* CONSUMER */}
              <button
                className="role-card"
                onClick={() => {
                  selectRole("consumer");
                }}
              >
                <div className="role-number">
                  01
                </div>

                <div className="role-info">
                  <h2>Consumer</h2>

                  <p>
                    Verify products and explore
                    their supply-chain journey.
                  </p>
                </div>

                <span className="role-arrow">
                  →
                </span>
              </button>

              {/* PRODUCER */}
              <button
                className="role-card"
                onClick={() => {
                  selectRole("producer");
                }}
              >
                <div className="role-number">
                  02
                </div>

                <div className="role-info">
                  <h2>Producer</h2>

                  <p>
                    Add products and document
                    their origin and production.
                  </p>
                </div>

                <span className="role-arrow">
                  →
                </span>
              </button>

              {/* PROCESSOR */}
              <button
                className="role-card"
                onClick={() => {
                  selectRole("processor");
                }}
              >
                <div className="role-number">
                  03
                </div>

                <div className="role-info">
                  <h2>Processor</h2>

                  <p>
                    Add processing information
                    and supporting records.
                  </p>
                </div>

                <span className="role-arrow">
                  →
                </span>
              </button>

              {/* DISTRIBUTOR */}
              <button
                className="role-card"
                onClick={() => {
                  selectRole("distributor");
                }}
              >
                <div className="role-number">
                  04
                </div>

                <div className="role-info">
                  <h2>Distributor</h2>

                  <p>
                    Record product movement and
                    distribution information.
                  </p>
                </div>

                <span className="role-arrow">
                  →
                </span>
              </button>

              {/* RETAILER */}
              <button
                className="role-card"
                onClick={() => {
                  selectRole("retailer");
                }}
              >
                <div className="role-number">
                  05
                </div>

                <div className="role-info">
                  <h2>Retailer</h2>

                  <p>
                    Add retail records and
                    connect products to their
                    final point of sale.
                  </p>
                </div>

                <span className="role-arrow">
                  →
                </span>
              </button>

            </div>

          </div>

        </section>
      </main>
    );
  }

  /* =========================
          <div style={{marginTop:"28px",paddingTop:"22px",borderTop:"1px solid rgba(0,0,0,.10)"}}><p className="eyebrow">INTERNAL</p><h2>SAFAL Verification Console</h2><p className="description">Internal evidence review. This is separate from the five public SAFAL roles.</p><button className="profile-continue-button" type="button" onClick={openVerificationConsole}><div><span>SAFAL INTERNAL</span><strong>Open Verification Console</strong></div><span>→</span></button></div>
     PROFILE SETUP
  ========================= */

  if (screen === "profile-setup") {

    const isConsumer =
      selectedRole === "consumer";

    const roleLabel =
      selectedRole
        ? selectedRole
            .charAt(0)
            .toUpperCase() +
          selectedRole.slice(1)
        : "Profile";

    const handleProfileContinue = async () => {
      if (!profileName.trim()) {
        setProfileError("Please enter your name.");
        return;
      }

      if (
        selectedRole !== "consumer" &&
        (!businessName.trim() || !businessLocation.trim())
      ) {
        setProfileError(
          "Please complete your business information."
        );
        return;
      }

      setProfileSaving(true);
      setProfileError("");

      try {
        let profileData = currentProfile;

        /* =========================
          CREATE MAIN PROFILE
        ========================= */

        if (!profileData) {
          const {
            data,
            error,
          } = await supabase
            .from("profiles")
            .insert({
              name: profileName.trim(),
              role: selectedRole,
            })
            .select()
            .single();

          if (error || !data) {
            console.error(
              "PROFILE INSERT ERROR:",
              error
            );

            setProfileError(
              "Your profile could not be saved."
            );

            return;
          }

          profileData = data;
        }

        /* =========================
          SAVE ROLE
        ========================= */

        const roleData = {
          profile_id: profileData.id,
          role: selectedRole,

          bio: profileBio.trim() || null,

          business_name:
            selectedRole === "consumer"
              ? null
              : businessName.trim(),

          business_location:
            selectedRole === "consumer"
              ? null
              : businessLocation.trim(),

          registration_number:
            selectedRole === "consumer"
              ? null
              : registrationNumber.trim() || null,
        };

        const {
          data: savedRole,
          error: roleError,
        } = await supabase
          .from("role_profiles")
          .upsert(roleData, {
            onConflict: "profile_id,role",
          })
          .select()
          .single();

        if (roleError || !savedRole) {
          console.error(
            "ROLE PROFILE ERROR:",
            roleError
          );

          setProfileError(
            roleError?.message ||
            "Your role information could not be saved."
          );

          return;
        }

        /* =========================
          UPDATE LOCAL ROLE LIST
        ========================= */

        setRoleProfiles((previous) => {
          const withoutCurrentRole =
            previous.filter(
              (item) =>
                item.role !== selectedRole
            );

          return [
            ...withoutCurrentRole,
            savedRole,
          ];
        });

        /* =========================
          SET ACTIVE ROLE
        ========================= */

        const updatedProfile = {
          ...profileData,
          activeRole: selectedRole,
        };

        setCurrentProfile(updatedProfile);
        setSelectedRole(selectedRole);

        localStorage.setItem(
          "safal_profile",
          JSON.stringify(updatedProfile)
        );

        setScreen(
          selectedRole === "consumer"
            ? "home"
            : selectedRole === "producer"
            ? "producer-workspace"
            : selectedRole === "processor"
            ? "processor-workspace"
            : selectedRole === "distributor"
            ? "distributor-workspace"
            : selectedRole === "retailer"
            ? "retailer-workspace"
            : "home"
        );
        setEditingRole(null);

      } catch (error) {
        console.error(
          "PROFILE SAVE ERROR:",
          error
        );

        setProfileError(
          "Something went wrong while saving your profile."
        );
      } finally {
        setProfileSaving(false);
      }
    };

    return (
      <main className="app">

        <section className="profile-setup-screen">

          <header className="page-header">

            <button
              className="back-icon"
              onClick={() =>
                setScreen(
                  editingRole
                    ? "my-profile"
                    : "profile"
                )
              }
            >
              ←
            </button>

            <span>
              PROFILE SETUP
            </span>

            <div />

          </header>

          <div className="profile-setup-content">

            <div className="profile-setup-intro">

              <p className="eyebrow">
                {roleLabel.toUpperCase()}
                {" "}PROFILE
              </p>

              <h1>
                Tell us a little
                <br />
                about yourself.
              </h1>

              <p className="description">

                {isConsumer
                  ? "Set up your SAFAL profile to start verifying products and exploring their supply-chain journey."
                  : `Set up your ${roleLabel.toLowerCase()} profile to contribute trusted information to the product journey.`}

              </p>

            </div>

            <div className="profile-form">

              <div className="profile-field">

                <label>
                  YOUR NAME
                </label>

                <input
                  type="text"
                  value={profileName}
                  onChange={(e) =>
                    setProfileName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your name"
                />

              </div>

              <div className="profile-field">
                <label>
                  BIO
                  <span className="optional">OPTIONAL</span>
                </label>

                <textarea
                  value={profileBio}
                  onChange={(e) =>
                    setProfileBio(e.target.value)
                  }
                  placeholder={
                    isConsumer
                      ? "Tell us a little about yourself"
                      : `Tell us about your ${roleLabel.toLowerCase()} business`
                  }
                  rows={4}
                />
              </div>

              {!isConsumer && (

                <>

                  <div className="profile-field">

                    <label>
                      BUSINESS NAME
                    </label>

                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) =>
                        setBusinessName(
                          e.target.value
                        )
                      }
                      placeholder="Enter business name"
                    />

                  </div>

                  <div className="profile-field">

                    <label>
                      BUSINESS LOCATION
                    </label>

                    <input
                      type="text"
                      value={businessLocation}
                      onChange={(e) =>
                        setBusinessLocation(
                          e.target.value
                        )
                      }
                      placeholder="City, State"
                    />

                  </div>

                  <div className="profile-field">

                    <label>
                      REGISTRATION NUMBER
                      <span className="optional">
                        OPTIONAL
                      </span>
                    </label>

                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) =>
                        setRegistrationNumber(
                          e.target.value
                        )
                      }
                      placeholder="Enter registration number"
                    />

                  </div>

                </>

              )}

            </div>

            <div className="profile-setup-note">

              <span>
                01
              </span>

              <p>

                {isConsumer
                  ? "Your profile helps SAFAL personalise your verification experience."
                  : "Business information will be connected to the records and products you contribute to SAFAL."}

              </p>

            </div>

            {profileError && (
              <p className="scan-error">
                {profileError}
              </p>
            )}

            <button
              className="profile-continue-button"
              onClick={handleProfileContinue}
              disabled={profileSaving}
            >

              <div>

                <span>
                  CONTINUE
                </span>

                <strong>
                  {profileSaving
                    ? "Saving profile..."
                    : editingRole
                    ? "Save changes"
                    : isConsumer
                    ? "Start exploring"
                    : "Set up workspace"}
                </strong>

              </div>

              <span>
                →
              </span>

            </button>

          </div>

        </section>

      </main>
    );
  }

  /* =========================
     HOME
  ========================= */

  return (
    <main className="app">
      <section className="home-screen">

        <header className="top-bar">
          <div className="brand">
            <div className="brand-mark">
              S
            </div>

            <span>SAFAL</span>
          </div>

          <button
            className="profile-btn"
            onClick={() => {
              if (currentProfile) {
                setScreen("my-profile");
              } else {
                setScreen("profile");
              }
            }}
          >
            Profile
          </button>
        </header>

        <div className="home-content">

          <section className="home-hero">
            <p className="eyebrow">
              PRODUCT TRUST & PROVENANCE
            </p>

            <h1>
              Know what you're
              <br />
              buying.
            </h1>

            <p>
              Check connected product and
              supply-chain records before
              making a decision.
            </p>
          </section>

          <button
            className="main-verify-card"
            onClick={goToScan}
          >
            <div className="verify-card-label">
              <span>
                PRODUCT VERIFICATION
              </span>

              <span>01</span>
            </div>

            <div className="verify-card-main">
              <div>
                <h2>
                  Verify a product
                </h2>

                <p>
                  Upload a QR image or enter
                  its unique product code.
                </p>
              </div>

              <span className="big-arrow">
                →
              </span>
            </div>
          </button>

          <section className="recent-section">

            <div className="recent-heading">
              <div>
                <p className="eyebrow">
                  ACTIVITY
                </p>

                <h2>
                  Recent scans
                </h2>
              </div>

              <span className="scan-count">
                {String(
                  recentScans.length
                ).padStart(2, "0")}
              </span>
            </div>

            {recentScans.length === 0 ? (
              <div className="empty-scans">
                <p>
                  No scans yet.
                </p>

                <span>
                  Verified products will
                  appear here.
                </span>
              </div>
            ) : (
              <div className="recent-list">

                {recentScans.map(
                  (scan) => (
                    <button
                      className="recent-scan-card"
                      key={scan.id}
                      onClick={() =>
                        openRecentScan(
                          scan
                        )
                      }
                    >
                      <div className="recent-thumbnail">

                        {scan.image ? (
                          <img
                            src={
                              scan.image
                            }
                            alt={
                              scan.name
                            }
                          />
                        ) : (
                          <div className="thumbnail-placeholder">
                            {scan.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "P"}
                          </div>
                        )}

                      </div>

                      <div className="recent-details">

                        <div className="recent-top-row">
                          <h3>
                            {scan.name}
                          </h3>

                          <span className="status-badge">
                            {scan.status.replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        </div>

                        <p>
                          {scan.code}
                        </p>

                        <div className="recent-bottom-row">

                          <span>
                            Confidence{" "}
                            <strong>
                              {scan.score}%
                            </strong>
                          </span>

                          <span>
                            {scan.time}
                          </span>

                        </div>
                      </div>

                      <span className="recent-arrow">
                        →
                      </span>
                    </button>
                  )
                )}

              </div>
            )}

          </section>
        </div>
      </section>
    </main>
  );

}
export default App;